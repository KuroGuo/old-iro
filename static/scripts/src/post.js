define(['app', 'vue', 'superagent', 'socket.io'], function (app, Vue, request, io) { 'use strict';
  var socket = io();

  var CommentsListView = Vue.extend({
    inherit: true,
    template: '#comments_template',
    data: function () {
      return {
        pagerMode: 'simple'
      };
    },
    computed: {
      simplePageButtons: function () {
        var pageButtons = [];

        var firstPage = this.currentPage - 2;

        if (this.currentPage <= 3) {
          firstPage = 1;
        } else if (this.currentPage >= this.comments.getPages() - 2) {
          firstPage = this.comments.getPages() - 4;
        }

        if (firstPage > 1)
          pageButtons.push({ text: '首', value: 1 });

        for (var i = firstPage; i <= firstPage + 4; i++) {
          if (i < 1)
            continue;
          else if (i > this.comments.getPages())
            break;

          pageButtons.push({ text: i, value: i });
        }

        if (firstPage + 4 < this.comments.getPages())
          pageButtons.push({ text: '尾', value: this.comments.getPages() });

        return pageButtons;
      },
      fullPageButtons: function () {
        var pageButtons = [];

        for (var i = 1; i <= this.comments.getPages(); i++) {
          pageButtons.push({ text: i, value: i });
        }

        return pageButtons;
      }
    },
    methods: {
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

  var CommentsFormView = Vue.extend({
    inherit: true,
    template: '#form_comment_template',
    data: function () {
      return {
        content: ''
      };
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
        var textarea = this.$el.querySelector('.textarea-content');

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
            postId: this.post.id,
            content: this.content,
            tempId: comment.tempId
          }
        });

        e.preventDefault();

        this.comments.insert(comment);

        textarea.innerHTML = this.content = '';
      }
    }
  });

  var CommentsView = Vue.extend({
    inherit: true,
    template: '#comments_wrapper_template',
    data: function () {
      return {
        comments: {
          list: [],
          pagesize: 15,
          count: null,
          getPages: function () {
            console.log(this.count, this.pagesize);
            return Math.ceil(this.count / this.pagesize);
          },
          insert: function (comment) {
            this.list.unshift(comment);
            if (this.list.length > this.pagesize) {
              this.list.pop();
              this.count++;
            }
          }
        },
        currentPage: 1,
        joined: false,
        socketioHandlers: {
          comment: {
            sendEnd: function (data) {
              var err = data.err;
              var tempId = data.body.tempId;
              var comment = data.body.comment;

              var i;
              for (i = 0; i < this.comments.list.length; i++) {
                if (this.comments.list[i].tempId === tempId)
                  break;
              }

              if (err) {
                comment = this.comments.list[0];
                comment.err = err;
                this.comments.list.$set(i, comment);
                throw err;
              }

              this.comments.list.$set(i, comment);
            },
            joinend: function (data) {
              this.joined = true;
            },
            receive: function (data) {
              var comment = data.body.comment;
              this.comments.insert(comment);
            }
          }
        }
      };
    },
    events: {
      'hook:created': function () {
        var view = this;

        view.loadCommentsInfo(function () {
          if (view.comments.count > 0) {
            view.loadComments();
          }
        });

        socket.on('comment', function (data) {
          view.socketioHandlers.comment[data.method].call(view, data);
        });

        socket.emit('comment', {
          method: 'join',
          body: { postId: view.post.id }
        });
      }
    },
    methods: {
      loadCommentsInfo: function (callback) {
        var view = this;

        request.get('/p/comments/' + view.post.id, {
          pagesize: view.comments.pagesize
        }, function (err, res) {
          if (err)
            throw err;

          view.comments.count = res.body.count;

          if (typeof callback === 'function')
            callback();
        });
      },
      loadComments: function (page, callback) {
        var view = this;

        page = page || 1;

        request.get('/p/comments/' + view.post.id + '/' + page, {
          pagesize: view.comments.pagesize
        }, function (err, res) {
          if (err)
            throw err;

          view.comments.list = res.body;
          view.currentPage = page;

          if (typeof callback === 'function')
            callback();
        });
      }
    },
    components: {
      list: CommentsListView,
      form: CommentsFormView
    }
  });

  var postView = new Vue({
    el: '#main',
    data: function () {
      var article = document.querySelector('#article');
      return {
        post: {
          id: parseFloat(article.dataset.id),
          likes: parseFloat(article.dataset.likes) || 0,
          unlikes: parseFloat(article.dataset.unlikes) || 0   
        }
      };
    },
    components: {
      comments: CommentsView
    }
  });
});