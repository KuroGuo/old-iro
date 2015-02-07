define(['./app', 'vue'], function (app, Vue, CodeMirror) { 'use strict';
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