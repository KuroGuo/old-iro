define(['app', 'vue', 'superagent', 'socket.io'], function (app, Vue, request, io) { 'use strict';
  var socket = io();

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
      pagesize: 15,
      currentPage: 1,
      joined: false,
      pagerMode: 'simple',
      socketioHandlers: {
        comment: {
          sendEnd: function (data) {
            var err = data.err;
            var tempId = data.body.tempId;
            var comment = data.body.comment;

            var view = this;

            var i;
            for (i = 0; i < view.comments.length; i++) {
              if (view.comments[i].tempId === tempId)
                break;
            }

            if (err) {
              comment = view.comments[0];
              comment.err = err;
              view.comments.$set(i, comment);
              throw err;
            }

            view.comments.$set(i, comment);
          },
          joinend: function (data) {
            this.joined = true;
          },
          receive: function (data) {
            var comment = data.body.comment;
            this.insertComment(comment);
          }
        }
      }
    },
    computed: {
      simplePageButtons: function () {
        var pageButtons = [];

        var firstPage = this.currentPage - 2;
        var lastPage = this.currentPage + 2;

        if (this.currentPage <= 3) {
          firstPage = 1;
        } else if (this.currentPage >= this.commentsInfo.pages - 2) {
          lastPage = this.commentsInfo.pages;
        }

        if (firstPage > 1)
          pageButtons.push({ text: '首', value: 1 });

        for (var i = firstPage; i <= firstPage + 4; i++) {
          if (i < 1)
            continue;
          else if (i > this.commentsInfo.pages)
            break;

          pageButtons.push({ text: i, value: i });
        }

        if (firstPage + 4 < this.commentsInfo.pages)
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

        socket.on('comment', function (data) {
          view.socketioHandlers.comment[data.method].call(view, data);
        });

        socket.emit('comment', {
          method: 'join',
          body: { postId: articleView.id }
        });
      }
    },
    methods: {
      loadCommentsInfo: function (callback) {
        var view = this;

        request.get('/p/comments/' + articleView.id, {
          pagesize: view.pagesize
        }, function (err, res) {
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

        request.get('/p/comments/' + articleView.id + '/' + page, {
          pagesize: view.pagesize
        }, function (err, res) {
          if (err)
            throw err;

          view.comments = res.body;
          view.currentPage = page;

          if (typeof callback === 'function')
            callback();
        });
      },
      insertComment: function (comment) {
        this.comments.unshift(comment);
        if (this.comments.length > this.pagesize) {
          this.comments.pop();
          this.commentsInfo.count++;
          this.commentsInfo.pages = Math.ceil(this.commentsInfo.count / this.pagesize);
        }
      },
      gotoPage: function (page, callback) {
        var view = this;

        if (typeof page === 'function') {
          callback = page;
          page = null;
        }

        view.loadComments(page, function () {
          window.scrollBy(0, view.$el.parentNode.getBoundingClientRect().top);

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
      postId: 0,
      content: ''
    },
    computed: {
      currentPage: function () {
        return commentsView.currentPage;
      },
      joined: function () {
        return commentsView.joined;
      }
    },
    methods: {
      onkeydown: function (e) {
        if (e.keyCode === 13 && !e.target.innerHTML)
          return e.preventDefault();
        if (e.ctrlKey && e.keyCode === 13) {
          var submit = document.createEvent('HTMLEvents');
          submit.initEvent('submit', false, true);
          this.$el.querySelector('form').dispatchEvent(submit);
          e.preventDefault();
        }
      },
      sync: function (e) {
        this.content = e.target.innerHTML;
      },
      send: function (e) {
        var view = this;

        var textarea = view.$el.querySelector('.textarea-content');

        var comment = {
          tempId: new Date().getTime() + Math.random(),
          content: textarea.innerHTML
        };

        if (!comment.content) {
          e.preventDefault();
          return;
        }

        socket.emit('comment', {
          method: 'send',
          body: {
            postId: view.postId,
            content: view.content,
            tempId: comment.tempId
          }
        });

        e.preventDefault();

        commentsView.insertComment(comment);

        textarea.innerHTML = formCommentView.content = '';
      }
    }
  });
});