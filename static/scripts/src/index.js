define(['./app', 'vue'], function (app, Vue) { 'use strict';
  var postListView = new Vue({
    el: '#post_list',
    computed: {
      lastReadId: {
        get: function () {
          return parseFloat(window.sessionStorage.lastReadId);
        },
        set: function (val) {
          window.sessionStorage.lastReadId = val;
        }
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