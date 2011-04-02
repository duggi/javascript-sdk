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

G.provide("Window", {
  /**
   * There are also screen level properties for getting the height and width of
   * the screen. Normally what you want are the innerheight/width of the window
   * as all the content for your website is show in the window.
   *
   *   ----------------------------------------- <---------
   *   |  toolbar                              |          |
   *   | ------------------------------- <--   |          |
   *   | | Window                      |    |  |          |  -- Screen size
   *   | |                             |    |--WindowSize |
   *   | |                             |    |  |          |
   *   | |_____________________________| <--|  |          |
   *   |_______________________________________| <--------|
   *
   *
   *   All of our window methods allow passing of a specific window object so
   *   you can compute on iframes.
   *
   *   IE 8, FF, Chrome compat - April 2011
   */

  innerHeight: function(_window) {
    _window = _window || window;
    return _window.innerHeight || (_window.document.body && _window.document.body.clientHeight);
  },

  innerWidth: function(_window) {
    _window = _window || window;
    return _window.innerWidth || (_window.document.body && _window.document.body.clientWidth);
  },

  //Scroll Y position
  pageYOffset: function(_window) {
    _window = _window || window;
    return _window.pageYOffset || (_window.document.body && _window.document.body.scrollTop);
  },

  //Scroll X position
  pageXOffset: function(_window) {
    _window = _window || window;
    return _window.pageXOffset || (_window.document.body && _window.document.body.scrollLeft);
  },

  //Differs across operating systems. 17 is the smallest working number on all browsers
  //Taken from: http://stevenbenner.com/2010/04/calculate-page-size-and-view-port-position-in-javascript/
  scrollBarPadding: function() {
    return 17;
  },

  //Centers a element using style
  centerElement: function(domElement, _window) {
    _window = _window || window;
    if (!domElement) return;

    var innerHeight = G.Window.innerHeight(_window),
            innerWidth = G.Window.innerWidth(_window),
            verticalOffset = G.Window.pageYOffset(_window),
            horizontalOffset = G.Window.pageXOffset(_window),
            scrollBarPadding = G.Window.scrollBarPadding(_window);

    domElement.style.top = ((verticalOffset + innerHeight / 2) -
            (scrollBarPadding + domElement.offsetHeight / 2 )) + "px";
    domElement.style.left = ((horizontalOffset + innerWidth / 2) -
            (scrollBarPadding + domElement.offsetWidth / 2 )) + "px";
    domElement.style.position = "absolute";
  }

});
