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

G.provide("String", {

  toCamelCase: function(string) {
    var newString = String(string);
    var re = /(_)([a-z].*?)/gi,
      matchResult = re.exec(newString);
    while (matchResult) {
      if (matchResult[2]) {
        newString = newString.replace(matchResult[0], matchResult[2].toUpperCase())
      }
      matchResult = re.exec();
    }
    return newString
  },

  toUnderscore: function(string) {
    if (!string) return string;
    return string.replace(/([A-Z])/g, function($1) {
      return "_" + $1.toLowerCase();
    });
  },
  
  reverse: function(s) {
    return s.split("").reverse().join("");
  }

});
