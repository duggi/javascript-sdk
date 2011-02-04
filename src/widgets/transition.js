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
 * Provides basic support for transitioning between components.
 */
G.provide("", {
  newTransitionMap:function() {
    return new G.transition.Base();
  }
});


G.provide("transition", {

  Base:function() {
    var transitions = {};

    this.addTransitions = function(transObj) {
      G.copy(transitions, transObj, true);
    };

    this.trigger = function(fromWidget, toWidget, urlParams) {
      var fn;
      if (!toWidget) throw("G.transition.trigger: Must go somewhere with toWidget");
      if (!fromWidget || fromWidget == toWidget) { //Treating refresh as same as initial load
        fn = transitions[toWidget.name];
        if (fn) fn(toWidget, urlParams);
      } else {
        fn = transitions[fromWidget.name + "_" + toWidget.name];
        if (fn) fn(fromWidget, toWidget, urlParams);
      }
    };
  }


});