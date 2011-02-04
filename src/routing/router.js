/**
 * Copyright (c) 2010 Timothy Cardenas
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

G.provide("", {
  route:function(hash, callback) {
    G.router.route.call(G.router, hash, callback);
  }
});

G.provide("router", {

  routes: {},

  init:function() {
    G.addEvent(window, 'hashchange', G.router.execRoute);
  },

  route:function(hash, callback) {
    G.router.routes[hash] = callback;
  },

  execRoute:function() {
    var hash = window.location.hash.slice(1);
    var urlParams = hash.split("/");
    var callback = G.router.routes[urlParams.shift()];
    if (callback) callback(urlParams);
  }

});

//Gets called at framework runtime
//(function() {

//  backup if hashchange event is not supported for ie7 (bah! FUCKING IE)
//  if(G.browser.ieVersion() < 8){
//    var ieFrame = document.createElement("iframe");
//    var prevHash = null;
//    setInterval(function(){
//      if(window.location.hash != prevHash){
//        G.router.execRoute();
//        prevHash = window.location.hash;
//      }
//    }, 150);
//  }

//})();
