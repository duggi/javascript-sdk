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
 * Definition - Chainable Function:
 *   A Chainable function must define a callback function it calls when it
 *   is finished processing. The generic signiture that a Chainable Function
 *   must adhere to is: fn(callback) or fn(params_for_fn, callback);
 *   That callback function must be called for the chain to continue firing
 */

G.provide("",{

  newFnChain:function(){
    return new G.FnChain.Base();
  }
});

G.provide("FnChain",{

  Base:function(){
    var chain = [];


    /**
     * Push a Chainable Function onto the chain queue
     *
     * @param fn       {Function}           A chainable function to be
     *                                        pushed on the queue
     * @param params   {Array}[Optional]    Array of params
     *                                        for the chainable function
     * @param callback {Function}[Optional] Callback called after this link
     *
     */
    this.push = function(){
      var args = Array.prototype.slice.call(arguments),
      fn = args.shift(),
      next = args.shift(),
      params = null,
      callback = null,
      cbParams = null;

      while(next){
        var type = typeof next;
        if (type === 'function' && !callback) {
          callback = next;
        } else if (next instanceof Array && !params) {
          params = next;
        } else if (next instanceof Array && !cbParams) {
          cbParams = next;
        } else {
          throw('Invalid argument passed to FnChain.push(): ' + next);
          return this;
        }
        next = args.shift();
      }

      var link = {
        fn:fn,
        params:params,
        callback:callback
      }

      chain.push(link);
      
      return this; //Makes push chainable (in the jquery sense)
    }

    /**
     * Sequentially fire the functions and callbacks in the chain FIFO.
     */
    this.fire = function(){
      if(chain.length <= 0) return;

      var link = chain.shift(), callee = arguments.callee;
      if(link.params){
        //Copying the params allows the chain to be fired again without side effects
        var tempParams = [];
        G.copy(tempParams, link.params);
        tempParams.push(modifiedCallback);
        link.fn.apply(this, tempParams);
      }
      else{
        link.fn(modifiedCallback);
      }

      function modifiedCallback(){
        if(link.callback){
          link.callback.apply(this, arguments);
        }
        callee();
      }
    }
    
    this.clear = function(){
      chain = [];
    }
  }

});