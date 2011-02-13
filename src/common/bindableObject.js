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
 * OF CONTRACT, TORT OR OTHERWISE, ARISING fromWidget, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

G.provide("", {
  newBindableObject: function(obj, deep, debug) {
    var bindable = new G.BindableObject.Base(debug);
    bindable.extend(obj, deep);
    return bindable;
  }

});

G.provide("BindableObject", {

  Base:function(debug) {

    var listeners = {},
      self = this,
      data = {};

    this.extend = function(obj, deep) {
      if (!obj) return;
      var copy = deep ? G.deepCopy : G.copy;
      copy(data, obj, true);

      //Only generate getters and setters for first level (no deep)
      for (var key in obj) {
        generateGetterSetter(key); //overrides previously existing g&s
      }
    };

    this.bind = function(key, fn) {
      listeners[key] = listeners[key] || [];
      self.unbind(key, fn); //Ensure no duplicates are created on accident
      listeners[key].push(fn);
    };

    this.unbind = function(key, fn) {
      listeners[key] = listeners[key] || [];
      for (var i = 0,len = listeners[key].length; i < len; ++i) {
        var listenerFn = listeners[key][i];
        if (listenerFn == fn) {
          listeners[key].splice(i, 1);
        }
      }
    };

    //Dumps to console if possible
    this.dump = function() {
      G.log(data);
      G.log(listeners);
    };


    function generateGetterSetter(name) {
      self[name] = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length == 0) {
          return data[name];
        } else {
          var value = args.shift(),
            deepCopy = args.shift();
          return set(name, value, deepCopy);
        }
      }
    }

    function set(key, value, deepCopy) {
      listeners[key] = listeners[key] || [];
      if (deepCopy && typeof value === 'object') {
        var empty = (value instanceof Array) ? [] : {};
        data[key] = G.deepCopy(empty, value, true)
      } else {
        data[key] = value;
      }
      for (var i in listeners[key]) {
        if (debug) G.log("--Event Listener on key: " + key + " Fired--");
        listeners[key][i](data[key]);
      }
      return data[key];
    }

  }

});