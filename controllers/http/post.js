'use strict';

var post = require('../../services/post');
var date = require('../../utils/date');

exports.create = function (req, res, next) {
  var title = req.body.title;
  var content = req.body.content;
  var writer = req.session.user.name;

  if (!title) {
    return res.status(400).send('标题不能为空');
  }

  post.create({
    title: title,
    content: content,
    writer: writer
  }, function (err, post) {
    if (err)
      return next(err);

    res.redirect('/p/' + post._id);
  });
};

exports.list = function (req, res, next) {
  var page = parseFloat(req.params.page || 1);

  post.find({
    mode: '-id',
    page: page
  }, function (err, result) {
    if (err)
      return next(err);

    if (page > result.pages)
      return res.redirect('/l/' + result.pages);

    res.render('list', {
      posts: result.posts,
      pages: result.pages,
      currentPage: page,
      current: 'list'
    });  
  });
};

exports.view = function (req, res, next) {
  var user = req.session.user;
  var id = req.params.id;

  post.findById(id, function (err, post) {
    if (err)
      return next(err);

    if (!post)
      return res.redirect('/');

    post.createTimeString = date.toDateTimeString(post.createTime);

    res.render('post', {
      post: post,
      pageTitle: post.title,
      user: user
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
  var postId = req.body.postId;
  var content = req.body.content;
  var writer = req.session.user.name;

  if (!postId || !content) {
    return res.status(400).send('哥，不能为空啊');
  }

  post.comment(postId, { content: content, writer: writer }, function (err) {
    if (err)
      return next(err);

    res.end();
  });
};

exports.comments = function (req, res, next) {
  var postId = req.params.postId;
  var page = req.params.page;
  var pagesize = req.query.pagesize;

  post.findComments({
    postId: postId,
    page: page,
    pagesize: pagesize
  }, function (err, comments) {
    if (err)
      return next(err);

    comments.forEach(function (comment) {
      comment.createTimeString = date.toDateTimeString(comment.createTime);
    });

    res.send(comments);
  });
};

exports.commentsInfo = function (req, res, next) {
  var postId = req.params.postId;
  var pagesize = req.query.pagesize;

  post.getCommentsInfo({
    postId: postId,
    pagesize: pagesize
  }, function (err, info) {
    if (err)
      return next(err);

    res.send(info);
  });
};