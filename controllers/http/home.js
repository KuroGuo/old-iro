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

exports.loginView = function (req, res) {
  res.render('login');
};

exports.login = function (req, res) {
  var nickname = req.body.nickname;
  var originalUrl = req.session.originalUrl;

  req.session.user = { name: nickname };

  res.redirect(req.session.originalUrl);
};

exports.logout = function (req, res) {
  req.session.user = null;
  res.redirect('/login');
};