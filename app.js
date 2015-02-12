'use strict';

var config = require('./config');
var express = require('express');
var session = require('express-session');
var compression = require('compression');
var bodyParser = require('body-parser');
var multer = require('multer');
var mongoose = require('mongoose');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var socketioRouter = require('./socketio_router');
var MongoStore = require('connect-mongo')(session);
var httpRouter = require('./http_router');
var path = require('path');
var errorhandler = require('./middlewares/errorhandler');
var cookieParser = require('cookie-parser')

mongoose.connection.on('error', function (err) {
  console.error(err);
});

mongoose.connect(config.db);

var sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

io.use(function (socket, next) {
  var cookie = require('express/node_modules/cookie');

  var handshake = socket.handshake;

  //没有cookie则退出
  if (!handshake.headers.cookie)
    return next(new Error('socket.io: no found cookie.'));

  //根据cookie找sessionId,https://github.com/DanielBaulig/sioe-demo/blob/master/app.js
  handshake.cookie = cookie.parse(handshake.headers.cookie);
  var sessionId = cookieParser.signedCookie(handshake.cookie['connect.sid'], config.sessionSecret);

  //根据sessionId找username
  sessionStore.get(sessionId, function(err,session){
    if(err || !session)
      return next(new Error('socket.io: no found session.'));

    handshake.session = session;

    if(handshake.session.user)
      return next();
    else
      return next(new Error('socket.io: no found session.user'));
  })
});

io.use(socketioRouter);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

if (process.env.DELAY) {
  app.use(function (req, res, next) {
    setTimeout(function () {
      next(); 
    }, 500);
  });
}

app.use(compression());

app.use('/static', express.static(path.join(__dirname, 'static')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());

app.use(session({
  secret: config.sessionSecret,
  resave: true,
  saveUninitialized: true,
  store: sessionStore
}));

app.use(httpRouter);

app.use('/static', function (req, res) {
  res.status(404).end();
});

if (!process.env.TEST) {
  app.use(function (req, res) {
    res.redirect('/');
  });
}

app.use(errorhandler);

http.listen(config.port, function () {
  console.log('Listenning port ' + config.port);
});

module.exports = app;