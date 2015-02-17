'use strict';

var post = require('../../services/post');

exports.index = function (req, res, next) {
  post.find({
    mode: 'lastComment'
  }, function (err, result) {
    if (err)
      return next(err);

    res.render('index', {
      posts: result.posts
    });  
  });
};

exports.about = function (req, res) {
  res.render('about');
};

exports.loginView = function (req, res) {
  var referer = req.headers.referer;

  if (referer.indexOf(req.headers.host) >= 0)
    req.session.loginReferer = referer;
  else
    req.session.loginReferer = '/';

  res.render('login');
};

exports.login = function (req, res) {
  var nickname = req.body.nickname;
  var loginReferer = req.session.loginReferer;

  req.session.user = { name: nickname };

  res.redirect(req.session.loginReferer);
};

exports.logout = function (req, res) {
  req.session.user = null;

  var referer = req.headers.referer;

  if (referer.indexOf(req.headers.host) === -1)
    referer = '/';

  res.redirect(referer);
};