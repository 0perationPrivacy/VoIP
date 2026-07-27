const config =  require('./config.js');

const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const cors = require("cors");
require('dotenv').config()
const path = require('path');
var session = require('cookie-session')
var compression = require('compression')
app.use(compression())

// Refuse to boot on the placeholder secrets checked into .env — those values
// are public (visible to anyone who has cloned this repo), so running with
// them means forgeable sessions and/or unreadable stored credentials.
;['COOKIE_KEY', 'COOKIE_KEY2', 'CREDENTIALS_ENCRYPTION_KEY'].forEach((name) => {
  const value = (process.env[name] || '').trim();
  if (!value || value.startsWith('CHANGE_ME')) {
    console.error(
      `Refusing to start: ${name} is unset or still the placeholder from .env. ` +
      `Generate one (e.g. \`openssl rand -hex 32\`) and set it before running the server.`
    );
    process.exit(1);
  }
});

// TEMP diagnostic: log every incoming request before any routing/auth, so
// nothing can go unlogged while tracking down a request that isn't reaching
// any of the normal route handlers.
app.use((req, res, next) => {
  console.log(`>>> INCOMING ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

var expiryDate = new Date(Date.now() + 60 * 60 * (1000 * 12 * 30)) // 30 day
app.use(session({
  name: 'session',
  keys: [process.env.COOKIE_KEY, process.env.COOKIE_KEY2],
  cookie: {
    secure: true,
    httpOnly: true,
    expires: expiryDate
  }
}))

let setCache = function (req, res, next) {
  const period = 60 * 60 * 24
  if (req.method == 'GET') {
    res.set('Cache-control', `public, max-age=${period}`)
  } else {
    res.set('Cache-control', `no-store`)
  }
  next()
}
app.use(setCache)

var RateLimit = require('express-rate-limit');
const helmet = require("helmet");
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    reportOnly: false,
    directives: {
      "default-src": ["'self'", "sdk.twilio.com","wss:","ws:","eventgw.twilio.com"
    ],
      "object-src": ["'self'"],
      "script-src": ["'self'","'unsafe-eval'", "'unsafe-inline'"]
    },
  })
);
//sdk.twilio.com
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.disable('x-powered-by');
app.set('trust proxy', 1)
const server = require('http').createServer(app);

global.io = require('socket.io')(server,{ cors: { origin: '*' } });

var mongoose = require('./config/db.config');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('database connected successfully!');
});

//app.use(cors());
app.use(cors({ origin: ['http://localhost:8080'], }))

var limiter = new RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  message: "Slow down your requests!",
  headers: false
});
  
// apply rate limiter to all requests
app.use(limiter);
io.on('connection', socket => {
  console.log('a user connected');
  socket.on('join_channel', (channel) => {
    console.log(`${channel} user joined channel`);
    socket.join(channel);
  });
  socket.on('join_profile_channel', (channel) => {
    console.log(`${channel} user joined channel`);
    socket.join(channel);
  });
});

app.use('/frontend/dist/index.html', express.static('frontend/dist/index.html'));
app.use('/version.md', express.static('version.md'));
// app.enable('trust proxy')
if( process.env.HTTPS.trim() === 'true'){
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https'){
      if(req.url == '/get-base-url'){
        next()
        // res.status(200).json({url: process.env.BASE_URL.trim()});
      }else{
        res.sendFile(path.join(__dirname, './error/index.html'));
      }
    } else {
      next()
    }
  })

  /* app.use((req, res, next) => {
    console.log(req.url)
    console.log(req.secure)
    if (req.secure || req.url === '/error') {
      next()
    } else if(req.url == '/get-base-url'){
      res.status(200).json({url: process.env.BASE_URL.trim()});
    }else{
      // res.sendFile(path.join(__dirname, './error/index.html'));
    }
  }) */
}
// parse requests of content-type - application/json
// The `verify` callback stashes the raw bytes on the request — Telnyx webhook
// signatures are computed over the exact bytes sent, so the re-serialized
// req.body wouldn't reliably match.
app.use(bodyParser.json({
  limit: '500mb',
  parameterLimit: 10000000,
  verify: (req, res, buf) => { req.rawBody = buf; },
}));

// parse requests of content-type - application/x-www-form-urlencoded
// Same rawBody capture as above — Telnyx's TeXML voice webhooks (call.telnyx,
// call.statusTelnyx) arrive form-encoded, matching Twilio's format for
// drop-in compatibility, but Telnyx still signs them Ed25519-over-raw-bytes
// the same as its JSON Call Control webhooks.
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '500mb',
  parameterLimit: 10000000,
  verify: (req, res, buf) => { req.rawBody = buf; },
}));
app.use('/uploads', express.static('uploads'));
// Removed: `/src` (empty, unused) and a blanket `/frontend` mount that served
// the entire uncompiled source tree (frontend/config, frontend/src, frontend/test)
// alongside the build output. Only the built `frontend/dist` needs to be public,
// and it already is via the mounts below.
app.use('/frontend/dist/static/', express.static('frontend/dist/static'));
app.get(`/error`, function (req, res) {
  res.sendFile(path.join(__dirname, './error/index.html'));
})
app.use(express.static(path.join(__dirname, './frontend/dist')));

require("./app/routes/auth.route")(app);
require("./app/routes/setting.route")(app);
require("./app/routes/profile.route")(app);
require("./app/routes/media.route")(app);
require("./app/routes/contact.route")(app);
require("./app/routes/email.route")(app);
require("./app/routes/call.route")(app);
require("./app/routes/hardwarekey.route")(app);


app.get('/api/users/', function (req, res) {
  res.status(200).json({message: 'success'});
})

app.get('/get-base-url', function(req, res) {
  res.status(200).json({url: process.env.BASE_URL.trim()});
});

// These SPA catch-alls must be registered last: Express matches routes in
// registration order, and `/:id` / `/:id/:name` would otherwise swallow any
// two-segment API path (confirmed live: GET /api/users/ returned the SPA's
// index.html, not JSON, before this reordering).
app.get(`/:id`, function (req, res) {
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
})
app.get(`/:id/:name`, function (req, res) {
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
})

server.listen(process.env.PORT)