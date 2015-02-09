'use strict';

var post = require('../../services/post');

exports.index = function (req, res, next) {
  post.find({
    mode: 'lastComment'
  }, function (err, posts) {
    if (err)
      return next(err);

    res.render('index', {
      posts: posts
    });  
  });
};

exports.about = function (req, res) {
  res.render('about');
};