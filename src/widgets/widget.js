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
 *
 * @provides G.pages G.widget
 * @requires G.provide G.ApiClient
 *
 */


/**
 * widget.js
 * Exposes api for manipulating 
 *
 */

G.provide("", {
  require: function(){
    return G.widget.require.apply(G.widget, arguments);
  },

  newWidget:function(){
    return G.widget.instance.apply(G.widget, arguments);
  },

  register:function(){
    return G.widget.register.apply(G.widget, arguments);
  }
  
});

G.provide("widget", {

  constructors: {},
  html:{},

  /**
   * Base constructor for all Widget instances
   */
  Base: function(pageName){

    this._html = G.widget.html[pageName];
    this.rootNode = initRootNode();
    
    function initRootNode(){
      var div = document.createElement("div"); //garbage collected automatically
      div.innerHTML = G.widget.html[pageName];
      return div;
    }

    this.hashOnAttribute = function(hash, attr){
      var elems = this.rootNode.getElementsByTagName("*");
      for(var i in elems){
        var elem = elems[i], pid;
        if(!!elem.getAttribute && !!(pid = elem.getAttribute(attr)) ){
          hash[pid] = elem;
        }
      }
    }

    this.preventDefault = function(e){
      if(!e){
        return;
      }

      //Everyone else support for canceling events
      if(e.preventDefault){
        e.preventDefault();
      }

      //IE support for canceling events
      e.returnValue = false;
    }

  },

  instance:function(pageName){

    if(!G.widget.constructors[pageName]){
      throw("G.widget.instance called on null constructor. ("+pageName+")");
      return;
    }

    var instance;
    (function(realG){ //could limit access to G if needed
      var fn, pids ={}, base, self;

      //Forces pageconstructor to be lexicaly bound to our current context
      //instead of iframe (current context should be current closure and
      //then main page closure)
      eval("fn = "+G.widget.constructors[pageName].toString()+";");

      //By default hash all elems with a pid for quick lookup later
      //pids hash avail in page (looks like global) but is just bound
      //in that page. (<3 closures). Do before instance is created so
      //pids hash can be referenced during instansiation.
      base = new realG.widget.Base(pageName);
      fn.prototype = base;
      base.hashOnAttribute(pids, "pid");

      instance = new fn();
      self = instance;

    })(G);

    return instance;
  },

  register: function(pageName, pageConstructor){
    
    if(typeof pageConstructor != "function"){
      throw("Fatal: G.widget.register only takes a constructor function as a argument");
      return;
    }
          
    G.widget.constructors[pageName] = pageConstructor;
  },

  require:function(path, pageName){
    G.widget.require.pages = G.Page.require.pages || {};

    pageName = pageName || G.widget.pathToName(path);
    
    //No Op when the page has already been required
    if(G.widget.require.pages[pageName]){
      return;
    }

    G.widget.require.pages[pageName] = pageName;

    
    if(!G.widget.constructors[pageName]){
      G.widget.fetch(path, pageName);
    }

  },

  ready:function(pageNames, callback){
    var intervalId,
    timeWaiting = 0,
    interval = 50;

    intervalId = setInterval(function(){
      timeWaiting += interval
      if(timeWaiting > 1000){
        G.log("G.widget.ready waiting over a second for ready state.");
        timeWaiting = 0;
      }

      for(var i in pageNames){
        var pageName = pageNames[i];
        if(!G.widget.constructors[pageName]){
          return;
        }
      }
      clearInterval(intervalId);

      callback();

    }, interval);
  },
  
  fetch: function(){
    var args = Array.prototype.slice.call(arguments),
    path = args.shift(),
    next = args.shift(),
    pageName,
    callback;

    while(next){
      var type = typeof next;

      if (type === 'string' && !pageName) {
        pageName = next;
      } else if (type === 'function' && !callback) {
        callback = next;
      }
      else{
        G.log('Invalid argument passed to G.widget.fetch(): ' + next);
        return;
      }
      next = args.shift();
    }


    //Default pageName will be the route to it with / replaced with undescores
    pageName = pageName || G.widget.pathToName(path);

    G.widget.fetchRequest(path, pageName, callback);
  },

  pathToName:function(path){
    return path.replace(/\//g, "_");
  },


  /**
   *
   */

  fetchRequest: function(path, pageName, callback ){

    //Preamble = dirty magic to pull references into iframe,
    //couples js with controller :(
    var preamble = "<script>window.G = top."+ globalName +";</script>";

    G.ApiClient.rest('widgets/show','get', {
      path: path,
      preamble: preamble,
      page_name: pageName
    }, function(html){

      if(!!callback){
        callback(G.widget.constructors[pageName]);
      }
    });
  }
});