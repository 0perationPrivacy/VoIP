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

var expiryDate = new Date(Date.now() + 60 * 60 * (1000 * 12 * 30)) // 30 day
app.use(session({
  name: 'session',
  keys: ['key1', 'key2'],
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
      "default-src": ["'self'", "sdk.twilio.com","wss:","ws:"],
      "object-src": ["'self'"],
      "script-src": ["'self'","'unsafe-eval'"]
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
app.use(bodyParser.json({limit: '500mb',parameterLimit: 10000000})); 

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb',parameterLimit: 10000000 }));
app.use('/uploads', express.static('uploads'));
app.use('/src', express.static('src'));
app.use('/frontend', express.static('frontend'));
app.use('/static', express.static('static'));
app.get(`/error`, function (req, res) {
  res.sendFile(path.join(__dirname, './error/index.html'));
})
app.get(`/:id`, function (req, res) {
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
})
app.get(`/:id/:name`, function (req, res) {
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
})
app.use(express.static(path.join(__dirname, './frontend/dist')));

require("./app/routes/auth.route")(app);
require("./app/routes/setting.route")(app);
require("./app/routes/profile.route")(app);
require("./app/routes/media.route")(app);
require("./app/routes/contact.route")(app);
require("./app/routes/email.route")(app);
require("./app/routes/call.route")(app);

app.get('/:id', function (req, res) {
  //res.send('Hello World')
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
})

app.get('/api/users/', function (req, res) {
  res.status(200).json({message: 'success'});
})

app.get('/get-base-url', function(req, res) {
  res.status(200).json({url: process.env.BASE_URL.trim()});
});
server.listen(process.env.PORT)