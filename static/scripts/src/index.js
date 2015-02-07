define(['./app', 'vue'], function (app, Vue) { 'use strict';
  var postListView = new Vue({
    el: '#post_list',
    data: {
      lastReadId: parseFloat(window.sessionStorage.lastReadId)
    },
    methods: {
      lastRead: function (id) {
        window.sessionStorage.lastReadId = this.lastReadId = id;
      }
    }
  });

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
});