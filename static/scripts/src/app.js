define(['vue', 'velocity'], function (Vue, Velocity) { 'use strict';
  ;(function () {
    if (document.ontouchstart === undefined)
      document.documentElement.classList.add('no-touch');
    else
      document.documentElement.classList.add('touch');
  })();

  ;(function () {
    var navigitorView = new Vue({
      el: '#navigitor',
      data: {
        navigitorShow: false,
        scrollY: window.scrollY,
        requestToken: null
      },
      ready: function () {
        window.addEventListener('scroll', this.windowOnScroll);
      },
      methods: {
        top: function () {
          this.scrollTo(document.documentElement);
        },
        pre: function () {
          var prePost = this.getCurrentPost().previousElementSibling;
          if (prePost)
            this.scrollTo(prePost);
        },
        next: function () {
          var nextPost = this.getCurrentPost().nextElementSibling;
          if (nextPost)
            this.scrollTo(nextPost);
        },
        preventDefault: function (e) {
          e.preventDefault();
        },
        scrollTo: function (element) {
          var view = this;
          Velocity(element, 'scroll', {
            duration: 400,
            mobileHA: false,
            begin: function () {
              window.removeEventListener('scroll', view.windowOnScroll);
            },
            complete: function () {
              window.addEventListener('scroll', view.windowOnScroll);  
            }
          });
          view.navigitorShow = false;
          view.scrollY = null;
        },
        getCurrentPost: function () {
          var posts = document.querySelectorAll('#main .post');
          var i;
          for(i = 0; i < posts.length; i++) {
            var top = posts[i].getBoundingClientRect(posts[i]).top;
            if (top >= 0)
              return posts[i];
          }
        },
        windowOnScroll: function () {
          var view = this;
          if (!view.requestToken) {
            view.requestToken = setTimeout(function () {
              view.navigitorShow = window.scrollY <= view.scrollY;

              view.scrollY = window.scrollY;

              view.requestToken = null;
            }, 100);
          }
        }
      }
    });
  })();
});