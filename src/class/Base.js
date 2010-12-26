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
 * Base class for most standard objects in library. Allows for a private scope
 * and public method exposure.
 *
 * To inherit you must create a instance of the function base and assign it
 * to the prototype of the function that is its subclass.
 *
 * Example:
 *
 *  function Base(){
 *    this.something = true;
 *  }
 *
 *
 *  function person(){
 *    this.prototype = new base();
 *  }
 *
 *  var p = new person();
 *  assert(p.something, we inherited from base using prototype chains);
 *
 */
G.provide("Class", {
  Base: function(){
    //Prevents polution of global namespace by forcing instansiation
    //when called as a normal function. see ninja book p64 (awesome)
    this.instantiationProtection = function(){
      if ( !(this instanceof arguments.callee) ){
        return new arguments.callee(arguments);
      }
    }

    //public methods for gift
    this.test = function(){
      return "WEE";
    }
  },
  init: function(){
    var i = new G.Class.Sub();
    console.log(i);
    G.Class.Sub.prototype = new G.Class.Base();
    return i;
  }
});

G.provide("Class", {
  Sub: function(){
    if(G.Class.Sub.prototype.constructor != G.Class.Base){
      G.Class.Sub.prototype = new G.Class.Base();
      return new G.Class.Sub();
    }
    this.yant= function(){
      return true;
    }
  }
});