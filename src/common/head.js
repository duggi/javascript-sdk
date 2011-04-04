/**
 * Copyright (c) 2011 Timothy Cardenas
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
 */

G.provide("Head", {

  // -------------------------------------------- INJECTION
  // we pass the document reference so we may construct and append in either
  // the clientWindow or our iframeWindow or perhaps future windows

  injectInlineCss: function(rules, doc) {
    doc = doc || window.document;
    var head = doc.getElementsByTagName("head")[0],
      style = doc.createElement("style"),
      rulesNode = doc.createTextNode(rules);
    style.type = 'text/css';
    if (style.styleSheet) {
      style.styleSheet.cssText = rulesNode.nodeValue;
    }
    else {
      style.appendChild(rulesNode);
    }
    head.appendChild(style);
  },

  injectCss: function (href, doc) {
    doc = doc || window.document;
    var style = R.createElement("link", doc, {
      href: href,
      rel: 'stylesheet',
      type: "text/css",
      media: "screen"
    });
    doc.getElementsByTagName('head')[0].appendChild(style);
  },

  injectScript: function (src, doc) {
    doc = doc || window.document;
    var script = R.createElement("script", doc, {
      src: src
    });
    doc.getElementsByTagName('head')[0].appendChild(script);
  }

});
