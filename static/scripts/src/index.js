define(['./app', 'vue', './components/comments'], function (app, Vue, CommentsView) { 'use strict';
  var newPostView = new Vue({
    el: '#new_post_form_wrapper',
    data: {
      content: ''
    },
    methods: {
      sync: function (e) {
        this.content = e.target.innerHTML;
      }
    }
  });

  var postList = document.querySelector('#post_list');

  Array.prototype.forEach.call(postList.querySelectorAll('.post'), function (post) {
    new Vue({
      el: post,
      data: {
        post: {}
      },
      events: {
        'hook:ready': function () {
          this.post = {
            id: parseFloat(this.$el.dataset.id),
            likes: parseFloat(this.$el.dataset.likes) || 0,
            unlikes: parseFloat(this.$el.dataset.unlikes) || 0,
            commentsCount: parseFloat(this.$el.dataset.commentsCount) || 0
          };
        }
      },
      components: {
        comments: CommentsView
      },
      methods: {
        broadcastLoad: function () {
          this.$broadcast('load');
        }
      }
    });
  });
});