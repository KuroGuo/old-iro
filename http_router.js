'use strict';

var router = require('express').Router();

var auth = require('./middlewares/auth');

var home = require('./controllers/http/home');
var post = require('./controllers/http/post');

router.get('/', auth.userRequired, home.index);
router.get('/about', home.about);
router.get('/login', home.loginView);
router.post('/login', home.login);
router.get('/logout', home.logout);

router.get('/l', post.list);
router.get('/l/:page', post.list);

router.get('/p/:id', auth.userRequired, post.view);
router.post('/p/create', auth.userRequired, post.create);
router.post('/p/like', auth.userRequired, post.like);
router.post('/p/unlike', auth.userRequired, post.unlike);
router.get('/p/comments/:postId', auth.userRequired, post.commentsInfo);
router.get('/p/comments/:postId/:page', auth.userRequired, post.comments);
router.post('/p/comment', auth.userRequired, post.comment);

module.exports = router;