define(['./app', 'vue', 'xss'], function (app, Vue, xss) { 'use strict';
  var newPostView = new Vue({
    el: '#new_post_form_wrapper',
    data: {
      content: ''
    },
    methods: {
      xss: function (e) {
        e.target.innerHTML = xss(e.target.innerHTML);
      },
      sync: function (e) {
        this.content = e.target.innerHTML;
      }
    }
  });
});