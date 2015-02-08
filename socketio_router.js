'use strict';

var comment = require('./controllers/socketio/comment');

module.exports = function (socket, next) {
  socket.on('comment', function (data) {
    comment[data.method].call(this, socket, data);
  });
  next();
};