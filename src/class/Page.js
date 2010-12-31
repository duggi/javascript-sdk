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



G.provide("pages");

G.provide("", {
  fetch: function(){
    G.Page.fetch.apply(G.Page, arguments);
  }
});

G.provide("Page", {

  constructors: {},

  Base: function(pageName){

    this.rootNode = document.getElementById(pageName);
    this._html = this.rootNode.innerHTML;

    this.hashOnAttribute = function(hash, attr){
      var elems = this.rootNode.getElementsByTagName("*");
      for(var i in elems){
        var elem = elems[i], pid;
        if(!!elem.getAttribute && !!(pid = elem.getAttribute(attr)) ){
          hash[pid] = elem;
        }
      }
    },

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

  create: function(pageName, pageConstructor){
    
    if(typeof pageConstructor != "function"){
      throw("Fatal: G.addPage only takes a constructor function as a argument");
      return;
    }

    console.log(pageName);

    G.Page.constructors[pageName] = pageConstructor;
  },
  
  fetch: function(){
    var args = Array.prototype.slice.call(arguments),
    path = args.shift(),
    container = args.shift(),
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
        G.log('Invalid argument passed to G.Page.fetch(): ' + next);
        return;
      }
      next = args.shift();
    }
    
    if(!container.appendChild){
      throw("Fetch called with invalid container. "+
        "Must be able to attachChild on it. Jquery: try $('someSelector')[0]");
    }


    //Default pageName will be the route to it with / replaced with undescores
    pageName = pageName || path.replace(/\//g, "_");

    G.Page.fetchRequest(path, container, pageName, callback);
  },



  fetchRequest: function(path, container, pageName, callback ){

    //Preamble = dirty magic to pull references into iframe,
    //couples js with controller :(
    var preamble = "<script>window.G = top."+ globalName +";</script>";

    G.ApiClient.rest('view_modules/page','get', {
      path: path,
      preamble: preamble
    }, function(html){

      G.pages[pageName] = G.Page.instantiate(pageName, container, html);

      if(!!callback){
        callback(G.pages[pageName]);
      }
    });
  },

  instantiate:function(pageName, container, html){

    //Append html to client supplied container
    var div = document.createElement("div"); //garbage collected automatically
    div.innerHTML = html;
    for(var i=0; i < div.childNodes.length; ++i){
      container.appendChild(div.childNodes[i]);
    }

    var pageDiv = document.getElementById(pageName);
    if(!pageDiv){
      throw("No page wrapper for page:"+pageName+" all pages must be wrapped"+
        "in a div with id equal to the page's name");
      return undefined;
    }

    var instance;
    (function(realG){
      var G ={}, fn, pids ={}, base;

      //We only allow access to the api from G in our pages. Encapsulates page
      //implementation and explicitly prevents coupling between pages.

      //TODO probably need to have some kind of permission coupling heirarchy.
      //that way we can have nested pages
      G['api'] = realG.api;
      G['user'] = realG.user;


      //Forces pageconstructor to be lexicaly bound to our current context
      //instead of iframe (current context should be current closure and
      //then main page closure)
      eval("fn = "+realG.Page.constructors[pageName].toString());

      //By default hash all elems with a pid for quick lookup later
      //pids hash avail in page (looks like global) but is just bound
      //in that page. (<3 closures). Do before instance is created so
      //pids hash can be referenced during instansiation.
      base = new realG.Page.Base(pageName);
      fn.prototype = base;
      base.hashOnAttribute(pids, "pid");

      instance = new fn();
      
    })(G);

    return instance;

  }
});