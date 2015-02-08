'use strict';

var post = require('../../services/post');

exports.join = function (socket, data) {
  var postId = data.body.postId;

  socket.join(postId);

  socket.emit('comment', { method: 'joinend' });
};

exports.send = function (socket, data) {
  var postId = data.body.postId;
  var tempId = data.body.tempId;
  var content = data.body.content;

  if (!postId || !content) {
    return socket.emit('comment', {
      method: 'sendEnd',
      body: { tempId: tempId },
      err: '不能为空'
    });
  }

  post.comment(postId, { content: content }, function (err, comment) {
    if (err) {
      return socket.emit('comment', {
        method: 'sendEnd',
        body: { tempId: tempId },
        err: err.message
      });
    }

    socket.emit('comment', {
      method: 'sendEnd',
      body: {
        tempId: tempId,
        comment: comment
      }
    });
    socket.broadcast.to(postId).emit('comment', {
      method: 'receive',
      body: {
        comment: comment
      }
    });
  });
};