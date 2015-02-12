'use strict';

exports.userRequired = function (req, res, next) {
  if (!req.session || !req.session.user) {
    if (req.session) {
      req.session.originalUrl = req.url;
    }
    return res.redirect('/login');
  }
  next();
};