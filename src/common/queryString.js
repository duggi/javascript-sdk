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
 * @provides G.api G.ApiClient
 * @requires G.provide G.Array
 *
 */

G.provide("QS", {
  /**
   * Encode parameters to a query string.
   *
   * @access private
   * @param   params {Object}  the parameters to encode
   * @param   sep    {String}  the separator string (defaults to '&')
   * @param   encode {Boolean} indicate if the key/value should be URI encoded
   * @return        {String}  the query string
   */
  encode: function(params, seperator, encode) {
    seperator = seperator === undefined ? '&' : seperator;
    encode = encode === false ? function(s) {
      return s;
    } : encodeURIComponent;

    var kvPairs = [];
    for (var key in params) {
      var val = params[key];
      if (val !== null && typeof val != 'undefined') {
        kvPairs.push(encode(key) + '=' + encode(val));
      }
    }
    kvPairs.sort();
    return kvPairs.join(seperator);
  }

});