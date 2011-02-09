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

/**
 * Basic object with observers for all attributes
 *
 */
G.provide("", {
  newViewModel: function(defaults) {
    var base = new G.ViewModel.Base();
    base.set(defaults);
    return base;
  }
});


G.provide("ViewModel", {

  Base:function() {

    var self = this;
    var data = {};
    var listeners = {};

    this.get = function(key) {
      return data[key];
    };

    this.set = function(key, value) {
      _set(key,value, true);
    };

    this.bind = function(key, context, fn) {
      listeners[key] = listeners[key] || [];
      var listener = {
        fn:fn,
        context:context
      };
      //Ensure no duplicates are created on accident
      this.unbind(key, context, fn);
      listeners[key].push(listener);
    };

    this.unbind = function(key, context, fn) {
      listeners[key] = listeners[key] || [];
      for (var i = 0,len = listeners[key].length; i < len; ++i) {
        var listener = listeners[key][i];
        if (listener.fn == fn && listener.context == context) {
          listeners[key].splice(i, 1);
        }
      }
    };

    this.updateOnly = function(key,value){
      _set(key, value, false);
    };
    
    this.debug = function(){
      G.log(data);
      G.log(listeners);
    };

    /**
     *  Copies key value pairs into data. If a object is provided as a key
     *  then we disregard the value and recursively call _set until all the
     *  keys have been transversed.
     *
     * @param key
     * @param value 
     * @param create {Boolean} If false setting will not create records (only update)
     */
    function _set(key, value, create) {
      listeners[key] = listeners[key] || [];
      if (typeof key === 'object') {
        var obj = key;
        for (var k in obj) {
          self.set(k, obj[k], create);
        }
      } else {
        //Need to think about cycles where the data is incremented on each touch
        var prev = data[key]; //doesn't solve the cycle issue completely
        if(prev == value) return; //don't trigger callbacks on no change
        if ((!create && key in data) || create) {
          data[key] = value;
        }
        for (var i in listeners[key]) {
          var listener = listeners[key][i];
          listener.fn.apply(listener.context, [value]);
        }
      }
    }

  }

});