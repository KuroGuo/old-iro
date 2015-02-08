define(['app', 'vue', 'superagent'], function (app, Vue, request) { 'use strict';
  var articleView = new Vue({
    el: article,
    data: function () {
      var article = document.querySelector('#article');
      return {
        id: parseFloat(article.dataset.id),
        likes: parseFloat(article.dataset.likes) || 0,
        unlikes: parseFloat(article.dataset.unlikes) || 0
      };
    },
    methods: {
      like: function () {
        var view = this;
        request.post('/p/like', { id: view.id }, function (err, res) {
          if (err || res.status !== 200) {
            view.likes--;
            if (err)
              throw err;
          }
        });

        view.likes++;
      },
      unlike: function () {
        var view = this;
        request.post('/p/unlike', { id: view.id }, function (err, res) {
          if (err || res.status !== 200) {
            this.unlikes--;
            if (err)
              throw err;
          }
        });

        view.unlikes++;
      }
    }
  });

  var commentsView = new Vue({
    el: '#comments',
    data: {
      comments: [],
      commentsInfo: {},
      currentPage: 0,
      pagerMode: 'simple'
    },
    computed: {
      simplePageButtons: function () {
        var pageButtons = [];

        var firstPage = Math.max(this.currentPage - 2, 1);
        var lastPage = firstPage + 4;

        if (firstPage > 1)
          pageButtons.push({ text: '首', value: 1 });

        for (var i = firstPage; i <= lastPage; i++) {
          if (i < 1)
            continue;
          else if (i > this.commentsInfo.pages)
            break;

          pageButtons.push({ text: i, value: i });
        }

        if (lastPage < this.commentsInfo.pages)
          pageButtons.push({ text: '尾', value: this.commentsInfo.pages });

        return pageButtons;
      },
      fullPageButtons: function () {
        var pageButtons = [];

        for (var i = 1; i <= this.commentsInfo.pages; i++) {
          pageButtons.push({ text: i, value: i });
        }

        return pageButtons;
      }
    },
    events: {
      'hook:created': function () {
        var view = this;
        view.loadCommentsInfo(function () {
          if (view.commentsInfo.pages > 0) {
            view.loadComments();
          }
        });
      }
    },
    methods: {
      loadCommentsInfo: function (callback) {
        var view = this;

        request.get('/p/comments/' + articleView.id, function (err, res) {
          if (err)
            throw err;

          view.commentsInfo = res.body;

          if (typeof callback === 'function')
            callback();
        });
      },
      loadComments: function (page, callback) {
        var view = this;

        page = page || 1;

        request.get('/p/comments/' + articleView.id + '/' + page, function (err, res) {
          if (err)
            throw err;

          view.comments = res.body;
          view.currentPage = page;

          if (typeof callback === 'function')
            callback();
        });
      },
      gotoPage: function (page, callback) {
        var view = this;

        if (typeof page === 'function') {
          callback = page;
          page = null;
        }

        view.loadComments(page, function () {
          window.scrollBy(0, view.$el.getBoundingClientRect().top);

          if (typeof callback === 'function')
            callback();
        });
        view.loadCommentsInfo();
      },
      togglePagerMode: function () {
        if (this.pagerMode === 'simple')
          this.pagerMode = 'full';
        else
          this.pagerMode = 'simple';
      }
    }
  });

  var formCommentView = new Vue({
    el: '#form_comment_wrapper',
    data: {
      content: '',
      sending: false
    },
    methods: {
      sync: function (e) {
        this.content = e.target.innerHTML;
      },
      send: function (e) {
        var view = this;
        var form = e.target;

        var textarea = this.$el.querySelector('.textarea-content')

        var comment = { content: textarea.innerHTML };

        if (!comment.content) {
          e.preventDefault();
          return;
        }

        request.post(form.action, { id: view.id, content: view.content }, function (err, res) {
          if (err || res.status !== 200) {
            view.sending = false;
            if (err)
              throw err;
            return;
          }

          commentsView.gotoPage(function () {
            view.sending = false;
            textarea.innerHTML = view.content = '';
          });
        });

        e.preventDefault();

        view.sending = true;
      }
    }
  });
});