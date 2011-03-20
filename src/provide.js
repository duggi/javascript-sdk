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

/**
 * Entry point into groupit javascript SDK.
 *
 * The entire SDK is wrapped in a closure when compiled so don't let
 * the seemingly global definitions confuse you. They are global to the SDK
 * but not to the app.
 */

//Save references in case of overwrite/no conflict mode
var _G = window.G;
var _isLogging = true;

var G = G || {
  instanceId:null, //(AKA instance-private key)
  appKey:null, //(AKA App Identifier)
  endPoint:null, //(AKA Server protocol and hostname)

  //TODO migrate these tokens from rest Object to here
  persistenceToken: null,
  appSecret:null,

  init:function(appKey, endPoint) {
    G.appKey = appKey;
    G.endPoint = endPoint;
    //Generate a unique random key for this specific instance of the JDK
    G.instanceId = (new Date().getTime()).toString() +
            Math.floor(Math.random() * 1000001).toString();
  },

  /**
   * Copy from one object to the specified namespace that is G.<target>.
   * If the namespace target doesn't exist, it will be created automatically.
   *
   * @param target    {Object|String}  the target object to copy into
   * @param source    {Object}         the source object to copy from
   * @param overwrite {Boolean}        indicate if we should overwrite
   * @return {Object} the *same* target object back
   */
  provide: function(target, source, overwrite) {
    return this.copy(
            typeof target == 'string' ? this.create(target) : target,
            source,
            overwrite
            );
  }
  ,
  /**
   * Create a namespaced object.
   *
   * @param name {String} full qualified name ('Util.foo', etc.)
   * @param value {Object} value to set. Default value is {}. [Optional]
   * @return {Object} The created object
   */
  create: function(name, value) {
    var node = G,
            nameParts = name ? name.split('.') : [],
            len = nameParts.length;
    for (var i = 0; i < len; i++) {
      var part = nameParts[i];
      var nso = node[part]; //nso = namespaced object
      if (!nso) { //prevents overriding
        nso = (value && i + 1 == len) ? value : {};
        node[part] = nso;
      }
      node = nso;
    }
    return node;
  }
  ,
  /**
   * Copies things from source into target.
   *
   * @param target    {Object}
   * @param source    {Object}
   * @param overwrite {Boolean}
   * @param transform  {function} [Optional], transformation function for
   *                            each item
   */
  copy: function(target, source, overwrite, transform) {
    for (var key in source) {
      if (overwrite || typeof target[key] === 'undefined') {
        target[key] = transform ? transform(source[key]) : source[key];
      }
    }
    return target;
  },

  deepCopy: function(target, source, overwrite, transform) {
    /*
     * Absolutely critical that copy is called first. That way the tree is
     * copied top down (so the references for sub objects are overridden with
     * our blank copies rather than pointers to the original source
     */
    G.copy(target, source, overwrite, transform);
    for (var key in source) {
      //Null is also a object, but we don't want to copy null as a blank obj
      if (typeof source[key] === 'object' && source[key] != null) {
        target[key] = (source[key] instanceof Array) ? [] : {};
        G.deepCopy(target[key], source[key], overwrite, transform);
      }
    }
    return target
  },

  /**
   * Removes standard groupit bindings from global namespace and
   *   replaces with user supplied alternative.
   *
   * @param altName {String} alternative global reference name
   */
  noConflict: function(altName) {
    //noConflicting with G sets to default
    if (altName == "G") {
      window.G = G;

    }
    else if (altName) {
      window[altName] = G;
      window.G = _G; //replace G with what was G before
    }

    globalName = altName;
    return G;
  }
}
        ;

//Do the proper bindings for the window.
window.G = G;

//SDK reference to itself in the caller's global namespace
var globalName = "G";

