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
 * Note on: function(window, undefined)
 *
 * The undefined is a normal variable and can be changed simply with
 * undefined = "new value";. So we create a local "undefined" variable
 * that is REALLY undefined. (see jquery source for example in the wild)
 *
 * The window variable is made local for performance reasons.
 * Because when javascipt looks up a variable, it first goes through the
 * local variables until it finds the variable name. When it's not found,
 * javascript goes through the next scope etc. until it filters through the
 * global variables. So if the window variable is made local, javascript
 * can look it up quicker.
 *
 * Source (Nicholas C. Zakas and Jquery)
 *
 */

/**
 * This is a wrapper that our entire sdk goes into. Its written into by
 * a compiler script don't edit this file unless you know what you are doing.
 */

(function(window, undefined){

  //INSERT_JAVASCRIPT_CODE_HERE

  })(window);