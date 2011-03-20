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
  require: function() {
    return G.widget.require.apply(G.widget, arguments);
  },

  newWidget:function() {
    return G.widget.instance.apply(G.widget, arguments);
  },

  register:function() {
    return G.widget.register.apply(G.widget, arguments);
  }

});

G.provide("widget", {

  constructors: {},
  html:{},

  /**
   * Base constructor for all Widget instances
   */
  Base: function(name, widgetType) {

    this.name = name;
    this._html = G.widget.html[widgetType];
    this.rootNode = initRootNode();

    function initRootNode() {
      var div = document.createElement("div"); //garbage collected automatically
      div.innerHTML = G.widget.html[widgetType];
      var frag = document.createDocumentFragment();
      for(var i in div.childNodes){
        frag.appendChild(div.childNodes[i]);
      }
      return frag;
    }

    this.hashOnAttribute = function(hash, attr) {
      var elems = this.rootNode.getElementsByTagName("*");
      for (var i in elems) {
        var elem = elems[i], pid;
        if (!!elem.getAttribute && !!(pid = elem.getAttribute(attr))) {
          hash[pid] = elem;
        }
      }
    };

    this.preventDefault = function(e) {
      if (!e) {
        return;
      }

      //Everyone else support for canceling events
      if (e.preventDefault) {
        e.preventDefault();
      }

      //IE support for canceling events
      e.returnValue = false;
    };


    this.detach = function() {
      var parent = this.rootNode.parentNode;
      if (parent) parent.removeChild(this.rootNode);
    };

  },

  /**
   * Creates a instance of our widget
   * @param name {String} The name of the instance, used for transitions etc
   * @param widgetType {String} The widget type declared with register
   * @param instanceObject {Object}[Optional] Extends instance with this obj
   */
  instance:function(name, widgetType, instanceObject) {

    if (!G.widget.constructors[widgetType]) {
      throw("G.widget.instance called on null constructor. (" + widgetType + ")");
    }
    if (!name) {
      throw("G.widget.instance called without a instance name");
    }

    var instance;
    (function(realG) { //could limit access to G if needed
      var pids = {}, base;

      //Forces page constructor to be lexicaly bound to our current context
      //instead of iframe (current context should be current closure and
      //then main page closure)
      eval("var " + widgetType + " = " + G.widget.constructors[widgetType].toString() + ";");
//    eval("fn = " + G.widget.constructors[widgetType].toString() + ";");

      //By default hash all elems with a pid for quick lookup later
      //pids hash avail in page (looks like global) but is just bound
      //in that page. (<3 closures). Do before instance is created so
      //pids hash can be referenced during instantiation.
      base = new realG.widget.Base(name, widgetType);
      eval(widgetType + ".prototype = base");
//      fn.prototype = base;
      base.hashOnAttribute(pids, "pid");

      eval("instance = new " + widgetType + "()");
//      instance = new fn();
      //Adds the instance data into the instance overwriting if necessary
      if (instanceObject) {
        G.copy(instance, instanceObject, true);
      }

      function S(selector) {
        if (jQuery) {
          return jQuery(base.rootNode).find(selector);
        }
      }

    })(G);

    return instance;
  },

  register: function(widgetType, pageConstructor) {

    if (typeof pageConstructor != "function") {
      throw("Fatal: G.widget.register only takes a constructor function as a argument");
    }

    G.widget.constructors[widgetType] = pageConstructor;
  },

  require:function(path, widgetType) {
    G.widget.require.pages = G.Page.require.pages || {};

    widgetType = widgetType || G.widget.pathToName(path);

    //No Op when the page has already been required
    if (G.widget.require.pages[widgetType]) {
      return;
    }

    G.widget.require.pages[widgetType] = widgetType;


    if (!G.widget.constructors[widgetType]) {
      G.widget.fetch(path, widgetType);
    }

  },

  ready:function(widgetTypes, callback) {
    var intervalId,
            timeWaiting = 0,
            interval = 50;

    intervalId = setInterval(function() {
      timeWaiting += interval
      if (timeWaiting > 1000) {
        G.log("G.widget.ready waiting over a second for ready state.");
        timeWaiting = 0;
      }

      for (var i in widgetTypes) {
        var widgetType = widgetTypes[i];
        if (!G.widget.constructors[widgetType]) {
          return;
        }
      }
      clearInterval(intervalId);

      callback();

    }, interval);
  },

  fetch: function() {
    var args = Array.prototype.slice.call(arguments),
            path = args.shift(),
            next = args.shift(),
            widgetType,
            callback;

    while (next) {
      var type = typeof next;

      if (type === 'string' && !widgetType) {
        widgetType = next;
      } else if (type === 'function' && !callback) {
        callback = next;
      }
      else {
        G.log('Invalid argument passed to G.widget.fetch(): ' + next);
        return;
      }
      next = args.shift();
    }


    //Default widgetType will be the route to it with / replaced with undescores
    widgetType = widgetType || G.widget.pathToName(path);

    G.widget.fetchRequest(path, widgetType, callback);
  },

  pathToName:function(path) {
    return path.replace(/\//g, "_");
  },


  /**
   *
   */

  fetchRequest: function(path, widgetType, callback) {

    //Preamble = dirty magic to pull references into iframe,
    //couples js with controller :(
    var preamble = "<script>window.G = top." + globalName + ";</script>";

    G.ApiClient.rest('widgets/show', 'get', {
      path: path,
      preamble: preamble,
      page_name: widgetType
    }, function(html) {

      if (!!callback) {
        callback(G.widget.constructors[widgetType]);
      }
    });
  }
});