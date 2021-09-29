const config =  require('./config.js');

const express = require('express')
const app = express()
var bodyParser = require('body-parser')
const cors = require("cors");
require('dotenv').config()
const path = require('path');

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

app.use(express.static(__dirname));

// parse requests of content-type - application/json
app.use(bodyParser.json({limit: '500mb',parameterLimit: 10000000})); 

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true, limit: '500mb',parameterLimit: 10000000 }));
app.use(express.static(path.join(__dirname, './frontend/dist')));

app.use('/uploads', express.static('uploads'));
app.use('/src', express.static('src'));
require("./app/routes/auth.route")(app);
require("./app/routes/setting.route")(app);
require("./app/routes/profile.route")(app);
require("./app/routes/media.route")(app);
require("./app/routes/contact.route")(app);
/*/api/auth/login*/
app.get('/', function (req, res) {
  //res.send('Hello World')
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
})
app.get('/:id', function (req, res) {
  //res.send('Hello World')
  res.sendFile(path.join(__dirname, './frontend/dist/index.html'));
})
app.get('/test', function(req, res){
  var msg = {test: 'test' }
  global.io.emit('chat message', msg);
  res.send({test:'test'});
})

app.get('/api/users/', function (req, res) {
  res.status(200).json({message: 'success'});
})

server.listen(process.env.PORT)