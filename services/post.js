'use strict';

var xss = require('xss');
var Post = require('../db/post');
var counter = require('./counter');

exports.pagesize = 15;

exports.create = function (post, callback) {
  var title = post.title;
  var content = post.content;

  content = xss(content);

  counter.generateId('post', function (err, id) {
    if (err)
      return callback.call(this, err);

    var post = new Post({
      _id: id,
      title: title,
      content: content,
      createTime: new Date(),
      likes: 0,
      unlikes: 0
    });

    post.save(callback);
  });
};

exports.find = function (options, callback) {
  var criteria = options.criteria;
  var sort = options.sort || { _id: -1 };
  var limit = options.limit || 20;

  Post
    .find(criteria, '-comments')
    .sort(sort)
    .limit(limit)
    .exec(callback);
};

exports.findHot = function (callback) {
  Post
    .aggregate()
    .project({
      _id: 1,
      title: 1,
      createTime: 1,
      likes: 1,
      unlikes: 1,
      sort: { $subtract: ['$likes', '$unlikes'] }
    })
    .sort({ sort: -1, _id: -1 })
    .exec(callback);
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

  content = xss(content);

  counter.generateId('post_' + postId, function (err, commentId) {
    if (err)
      return callback.call(this, err);

    var comment = {
      _id: commentId,
      content: content,
      createTime: new Date(),
      likes: 0,
      unlikes: 0
    };

    Post.update({ _id: postId }, {
      $push: {
        comments: comment
      }
    }, function (err, affects) {
      if (err)
        return callback.call(this, err);

      if (!affects)
        return callback.call(this, new Error('affects 0'));

      callback.call(this);
    });
  });
};

exports.findCommentsSortByLike = function (postId, page, callback) {
  findComments(postId, page, { 'comments.likes': -1 }, callback);
};

exports.findComments = function (postId, page, callback) {
  findComments(postId, page, { 'comments._id': -1 }, callback);
};

exports.getCommentsInfo = function (postId, callback) {
  var pagesize = exports.pagesize;

  postId = parseFloat(postId);

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
          pages: 0,
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

function findComments(postId, page, sort, callback) {
  var pagesize = exports.pagesize;

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