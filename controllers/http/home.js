'use strict';

var post = require('../../services/post');

exports.index = function (req, res, next) {
  post.find({
    mode: 'lastComment'
  }, function (err, result) {
    if (err)
      return next(err);

    res.render('index', {
      posts: result.posts,
      current: 'home'
    });  
  });
};

exports.about = function (req, res) {
  res.render('about');
};