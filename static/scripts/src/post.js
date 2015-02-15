define([
  'app',
  'vue',
  'superagent',
  'socket.io',
  './components/comments'
  ], function (app, Vue, request, io, CommentsView) { 'use strict';
  var postView = new Vue({
    el: '#post',
    events: {
      'hook:ready': function () {
        this.post = {
          id: parseFloat(this.$el.dataset.id),
          likes: parseFloat(this.$el.dataset.likes) || 0,
          unlikes: parseFloat(this.$el.dataset.unlikes) || 0
        };

        this.$broadcast('load');
      }
    },
    components: {
      comments: CommentsView
    }
  });
});