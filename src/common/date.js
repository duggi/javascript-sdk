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

G.provide("Date", {
/**
 * I hate those lazy javascript core developers that didn't bake this in.
 */

  //Taken from here: http://www.pelagodesign.com/blog/2009/05/20/iso-8601-date-validation-that-doesnt-suck/
  isIso8601Date:function(string) {
    if (!string) return false;
    return string.match(/^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?$/);
  },

  //Taken from last example on: https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference:Global_Objects:Date
  iso8601DateString:function(date) {
    function pad(n) {
      return n < 10 ? '0' + n : n
    }

    return date.getUTCFullYear() + '-'
      + pad(date.getUTCMonth() + 1) + '-'
      + pad(date.getUTCDate()) + 'T'
      + pad(date.getUTCHours()) + ':'
      + pad(date.getUTCMinutes()) + ':'
      + pad(date.getUTCSeconds()) + 'Z'
  },

  iso8601DateParse: function(dateString) {
    dateString = dateString.toLowerCase();
    var tSep = "t",
      tIndex = dateString.indexOf(tSep),
      spaceIndex = dateString.indexOf(" "),
      sep = null;

    if (tIndex != -1) sep = tSep;
    if (spaceIndex != -1) sep = " ";

    var justDate = !sep;

    if (justDate) return new Date(parseDate(dateString));
    else {
      var parts = dateString.split(sep);
      return new Date(parseDate(parts[0]) + parseTime(parts[1]));
    }


    /* returns number of milliseconds corresponding to beginning of that date
     * since the epoch
     */
    function parseDate(dateString) {
      try {
        //YYYY-MM-DD
        var parts = dateString.split("-");
        if (parts.length == 3) {
          return Date.UTC(parts[0], parseFloat(parts[1]) -1, parts[2]);
          //YYYYMMDD
        } else if (dateString.length == 8) {
          var year = dateString.substr(0, 4),
            month = dateString.substr(4, 2),
            day = dateString.substr(6);
          return Date.UTC(year, month,  day);
        } else {
          G.log("Date string was invalid. " + dateString);
          return 0;
        }
      } catch(err) {
        return 0;
      }
    }

    function parseTime(timeString) {
      try {
        var timeRe = /^(\d{2}).(\d{2}).(\d{2})/;
        if (!timeRe.test(timeString)) {
          G.log("Time String was invalid " + timeString);
          return 0;
        }
        var hour = timeString.substr(0, 2),
          minute = timeString.substr(3, 2),
          second = timeString.substr(6, 2);

        var diff = (Date.UTC(1970, 1, 1, hour, minute, second)) -
          (Date.UTC(1970, 1, 1));

        timeString = timeString.replace(timeRe, "");

        var offset = /^([+,-])(\d{2})/;
        if (offset.test(timeString)) {
          var opp = timeString.substr(0, 1),
            offHour = timeString.substr(1, 2),
            adjustment = parseFloat(offHour) * 60 * 60 * 1000;

          //Off GMT means you correct in opposite direction
          diff = (opp == "+") ? diff - adjustment : diff + adjustment;
        }
        return diff;

      } catch(err) {
        return 0;
      }
    }

  }

});