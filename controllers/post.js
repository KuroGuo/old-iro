'use strict';

var post = require('../services/post');

exports.create = function (req, res, next) {
  var title = req.body.title;
  var content = req.body.content;

  if (!title || !content) {
    return res.status(400).send('哥，标题和内容都不能为空啊');
  }

  post.create({
    title: title,
    content: content
  }, function (err, post) {
    if (err)
      return next(err);

    res.redirect('/p/' + post._id);
  });
};

exports.view = function (req, res, next) {
  var id = req.params.id;

  post.findById(id, function (err, post) {
    if (err)
      return next(err);

    if (!post)
      return res.redirect('/');

    res.render('post', {
      post: post,
      pageTitle: post.title
    });
  });
};

exports.like = function (req, res, next) {
  var id = req.body.id;

  post.like(id, function (err) {
    if (err)
      return next(err);

    res.end();
  });
};

exports.unlike = function (req, res, next) {
  var id = req.body.id;

  post.unlike(id, function (err) {
    if (err)
      return next(err);

    res.end();
  });
};

exports.comment = function (req, res, next) {
  var id = req.body.id;
  var content = req.body.content;

  if (!id || !content) {
    return res.status(400).send('哥，不能为空啊');
  }

  post.comment(id, { content: content }, function (err) {
    if (err)
      return next(err);

    res.end();
  });
};

exports.comments = function (req, res, next) {
  var postId = req.params.postId;
  var page = req.params.page;

  post.findComments(postId, page, function (err, comments) {
    if (err)
      return next(err);

    res.send(comments);
  });
};

exports.commentsInfo = function (req, res, next) {
  var postId = req.params.postId;

  post.getCommentsInfo(postId, function (err, info) {
    if (err)
      return next(err);

    res.send(info);
  });
};