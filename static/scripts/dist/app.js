define(["vue","velocity"],function(o,n){"use strict";!function(){document.documentElement.classList.add(void 0===document.ontouchstart?"no-touch":"touch")}(),function(){new o({el:"#navigitor",data:{navigitorShow:!1,scrollY:window.scrollY,lastNavigitorShowScrollY:window.scrollY,requestToken:null},ready:function(){window.addEventListener("scroll",this.windowOnScroll)},methods:{top:function(){this.scrollTo(document.documentElement)},pre:function(){var o=this.getCurrentPost(),n=o.previousElementSibling;this.scrollTo(n||o)},next:function(){var o=this.getCurrentPost(),n=o.nextElementSibling;this.scrollTo(n||o)},preventDefault:function(o){o.preventDefault()},scrollTo:function(o){var t=this;n(o,"scroll",{duration:1e3,mobileHA:!1,begin:function(){window.removeEventListener("scroll",t.windowOnScroll)},complete:function(){window.addEventListener("scroll",t.windowOnScroll)}}),t.navigitorShow=!1,t.scrollY=null},getCurrentPost:function(){var o,n=document.querySelectorAll("#main .post");for(console.log(n),o=0;o<n.length;o++){var t=n[o].getBoundingClientRect(n[o]).top;if(t>=0)return n[o-1]||n[o]}return n[n.length-1]},windowOnScroll:function(){var o=this;o.requestToken||(o.requestToken=setTimeout(function(){window.scrollY<=(o.scrollY||window.scrollY)?(o.navigitorShow=!0,o.lastNavigitorShowScrollY=window.scrollY):window.scrollY>o.lastNavigitorShowScrollY+100&&(o.navigitorShow=!1),o.scrollY=window.scrollY,o.requestToken=null},100))}}})}()});