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

// heavily leveraging http://www.askapache.com/javascript/my-favorite-javascript-2007.html
G.provide("cookie", {

  getExpDate: function (days, hours, minutes) {
    var expDate = new Date();
    if (typeof days == "number" && typeof hours == "number" && typeof hours == "number") {
      expDate.setDate(expDate.getDate() + parseInt(days));
      expDate.setHours(expDate.getHours() + parseInt(hours));
      expDate.setMinutes(expDate.getMinutes() + parseInt(minutes));
      return expDate.toGMTString();
    } else return "";
  },

  getCookie: function (name) {
    var arg = name + "=";
    var alen = arg.length;
    var clen = document.cookie.length;
    var i = 0;
    while (i < clen) {
      var j = i + alen;
      if (document.cookie.substring(i, j) == arg) return getCookieVal(j);
      i = document.cookie.indexOf(" ", i) + 1;
      if (i == 0)break;
    }
    return "";


    function getCookieVal(offset) {
      var endstr = document.cookie.indexOf(";", offset);
      if (endstr == -1) endstr = document.cookie.length;
      return decodeURIComponent(document.cookie.substring(offset, endstr));
    }

  },

  setCookie: function (name, value, expires, path, domain, secure) {
    document.cookie = name + "=" + encodeURIComponent(value) +
      ((expires) ? "; expires=" + expires : "") +
      ((path) ? "; path=" + path : "") +
      ((domain) ? "; domain=" + domain : "") +
      ((secure) ? "; secure" : "");
  },

  deleteCookie: function (name, path, domain) {
    if (G.cookie.getCookie(name)) {
      document.cookie = name + "=" + ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
  }


});