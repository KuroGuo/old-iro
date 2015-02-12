'use strict';

var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  content: String,
  createTime: Date,
  lastCommentTime: Date,
  writer: String,
  likes: Number,
  unlikes: Number,
  comments: [{
    _id: Number,
    content: String,
    createTime: Date,
    writer: String,
    likes: Number,
    unlikes: Number
  }]
});

module.exports = mongoose.model('Post', postSchema);