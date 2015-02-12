'use strict';

var xss = require('xss');
var Post = require('../db/post');
var counter = require('./counter');

exports.commentPagesize = 15;

exports.create = function (post, callback) {
  var title = post.title;
  var content = post.content;
  var writer = post.writer;

  content = xss(content);

  counter.generateId('post', function (err, id) {
    if (err)
      return callback.call(this, err);

    var now = new Date();

    var post = new Post({
      _id: id,
      title: title,
      content: content,
      createTime: now,
      writer: writer,
      lastCommentTime: now,
      likes: 0,
      unlikes: 0
    });

    post.save(callback);
  });
};

exports.find = function (options, callback) {
  var mode = options.mode || '-id';
  var pagesize = options.pagesize || 30;
  var page = options.page || 1;
  var includeContent = options.includeContent;
  var includeComments = options.includeComments;

  Post.count(function (err, count) {
    if (err)
      return callback.call(this, err);

    var posts = Post.aggregate().match({ comments: { $exists: true } });

    switch(mode) {
      case 'lastComment': 
        posts.sort({ lastCommentTime: -1, _id: -1 });
        break;
      case '-id': 
        posts.sort({ _id: -1 });
        break;
    }

    var inclusion = {
      title: 1,
      createTime: 1,
      writer: 1,
      lastCommentTime: 1,
      likes: 1,
      unlikes: 1,
      commentsCount: { $size: '$comments' }
    };

    if (includeContent)
      inclusion.content = 1;
    if (includeComments)
      inclusion.comments = 1;

    posts
      .skip(pagesize * (page - 1))
      .limit(pagesize)
      .project(inclusion)
      .exec(function (err, posts) {
        if (err)
          return callback.call(this, err);

        callback.call(this, null, {
          posts: posts,
          count: count,
          pages: Math.ceil(count / pagesize)
        });
      });
  });
};

exports.findById = function (id, callback) {
  Post.findById(id, '-comments', callback)
};

exports.like = function (id, callback) {
  Post.update({ _id: id }, { $inc: { likes: 1 } }, function (err, affects) {
    if (err)
      return callback.call(this, err);

    if (!affects)
      return callback.call(this, new Error('affects 0'));

    callback.call(this);
  });
};

exports.unlike = function (id, callback) {
  Post.update({ _id: id }, { $inc: { unlikes: 1 } }, function (err, affects) {
    if (err)
      return callback.call(this, err);

    if (!affects)
      return callback.call(this, new Error('affects 0'));

    callback.call(this);
  });
};

exports.comment = function (postId, comment, callback) {
  var content = comment.content;
  var writer = comment.writer;

  content = xss(content);

  counter.generateId('post_' + postId, function (err, commentId) {
    if (err)
      return callback.call(this, err);

    var now = new Date();

    var comment = {
      _id: commentId,
      content: content,
      createTime: now,
      writer: writer,
      likes: 0,
      unlikes: 0
    };

    Post.update({ _id: postId }, {
      $push: {
        comments: comment
      },
      lastCommentTime: now
    }, function (err, affects) {
      if (err)
        return callback.call(this, err);

      if (!affects)
        return callback.call(this, new Error('affects 0'));

      callback.call(this, null, comment);
    });
  });
};

exports.findCommentsSortByLike = function (postId, page, callback) {
  findComments({
    postId: postId,
    page: page,
    sort: { 'comments.likes': -1 }
  }, callback);
};

exports.findComments = function (options, callback) {
  var postId = options.postId;
  var page = options.page;
  var pagesize = parseFloat(options.pagesize) || exports.commentPagesize;

  findComments({
    postId: postId,
    page: page,
    sort: { 'comments._id': -1 },
    pagesize: pagesize
  }, callback);
};

exports.getCommentsInfo = function (options, callback) {
  var postId = parseFloat(options.postId);
  var pagesize = parseFloat(options.pagesize) || exports.commentPagesize;

  Post
    .aggregate()
    .match({ _id: postId, comments: { $exists: true } })
    .project({
      comments: { $size: '$comments' }
    })
    .exec(function (err, results) {
      if (err)
        return callback.call(this, err);

      if (!results.length) {
        return callback.call(this, null, {
          pagesize: pagesize,
          count: 0
        });
      }

      var count = results[0].comments;

      callback.call(this, null, {
        pages: Math.ceil(count / pagesize),
        pagesize: pagesize,
        count: count
      });
    });
};

function findComments(options, callback) {
  var postId = options.postId;
  var page = options.page;
  var sort = options.sort;
  var pagesize = options.pagesize || exports.commentPagesize;

  postId = parseFloat(postId);

  Post
    .aggregate()
    .match({ _id: postId })
    .project('comments')
    .unwind('comments')
    .sort(sort || { 'comments._id': -1 })
    .skip(pagesize * (page - 1))
    .limit(pagesize)
    .exec(function (err, posts) {
      if (err)
        return callback.call(this, err);

      var comments = posts.map(function (post) {
        return post.comments;
      });

      callback.call(this, null, comments);
    });
};