define(["./app","vue"],function(t,e){"use strict";new e({el:"#post_list",data:{lastReadId:parseFloat(window.sessionStorage.lastReadId)},methods:{lastRead:function(t){window.sessionStorage.lastReadId=this.lastReadId=t}}}),new e({el:"#new_post_form_wrapper",data:{content:""},methods:{sync:function(t){this.content=t.target.innerHTML}}})});