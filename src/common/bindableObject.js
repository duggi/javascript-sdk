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
  newBindableObject: function(obj, shallow, debug) {
    var bindable = new G.BindableObject.Base(debug);
    bindable.extend(obj, shallow);
    return bindable;
  }

});

G.provide("BindableObject", {

  Base:function(debug) {

    var listeners = {},
      self = this,
      data = {};

    /**
     * Extends the current object with a object or array.
     *
     * If passed a object both the keys and values will be mapped into the
     * bindable object. Setters will fire callbacks on the newly set and
     * defined key/value pairs.
     *
     * Note: Objects may pass a boolean value to determine if deep copy or
     * shallow copying should occur. By default we shallow copy.
     *
     * If passed a array only the setters/getters will be mapped using the
     * values in the array as keys. No callbacks are issued as the data has
     * not changed.
     *
     * @param obj
     * @param shallow
     */
    //Opt into shallow copy for optimization
    this.extend = function(obj, shallow) {
      if (!obj) return;
      if (typeof obj !== "object") throw("Must pass object/array to extend");

      if (obj instanceof Array) {
        G.Array.map(obj, function(val) {
          self.generateGetterSetter(val); //overrides previously existing g&s
          self.generateCallback(val);
        });
      } else {
        //Only generate getters and setters for first level (no deep)
        for (var key in obj) {
          self.generateGetterSetter(key); //overrides previously existing g&s
          self.generateCallback(key);
          self[self.nameConversion(key)](obj[key], shallow); //Extend is just looping through the set methods
        }
      }
    };

    //Simply calls all the event handlers in the system. Useful when the handlers
    //are disabled and the client wants to get caught up with the current state
    this.flush = function() {
      for (var key in data) {
        fireOnKey(key);
      }
    };

    //Nice to get at the raw data without all the getter calls.
    this.data = function() {
      return G.deepCopy({}, data, true);
    };

    //Dumps to console if possible
    this.dump = function() {
      G.log(data);
      G.log(listeners);
    };

    //Overridable method to create a different interface without changing the
    //underlying data
    this.nameConversion = function(name) {
      return name;
    };

    this.callbackName = function(name) {
      name = self.nameConversion(name);
      return "on" + name[0].toUpperCase() + name.slice(1);
    };

    this.generateCallback = function(name) {
      var keyName = self.callbackName(name);
      self[keyName] = function(fn, remove) {
        listeners[name] = listeners[name] || {};
        if (remove) {
          //remove that key in hash from listener data-store
          delete listeners[name][fn];
        } else {
          //duplicates not possible with te hash
          listeners[name][fn] = fn;
        }
      }
    };

    this.generateGetterSetter = function (name) {
      self[this.nameConversion(name)] = function() {
        var args = Array.prototype.slice.call(arguments);
        if (args.length == 0) {
          return data[name];
        } else {
          var value = args.shift(),
            deep = args.shift();
          return set(name, value, deep);
        }
      };
    };

    function fireOnKey(key) {
      for (var fn in listeners[key]) {
        if (listeners[key][fn]) {
          if (debug) G.log("--Event Listener on key: " + key + " Fired--");
          listeners[key][fn](data[key]);
        }
      }
    }

    //Deep copy is non trivial and in some circumstances doesn't work as expected
    //if you need a deep copy you can ask for one
    function set(key, value, deep) {
      listeners[key] = listeners[key] || [];
      //Null's type is "object"... doh
      if (deep && typeof value === 'object' && value != null) {
        var empty = (value instanceof Array) ? [] : {};
        data[key] = G.deepCopy(empty, value, true)
      } else {
        data[key] = value;
      }

      fireOnKey(key);
      return data[key];
    }

  }

});