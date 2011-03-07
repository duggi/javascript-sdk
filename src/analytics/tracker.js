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
 * OF CONTRACT, TORT OR OTHERWISE, ARISING fromWidget, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

G.provide("Tracker", {

  iframe: null,
  endpoint: "http://analytics.groupit.com", //TODO need https support on this domain
  accountToken: null,

  init: function() {
    G.Tracker.iframe = G.ApiClient.createHiddenIframe();
  },

  trackEvent: function (category, action, optLabel, optValue, accountToken) {
    accountToken = accountToken || G.Tracker.accountToken;
    if (!accountToken || !category || !action) {
      G.log("Analytics can't track event for: cat:" + category +
        " action:" + action + " and accountToken:" + accountToken);
      return;
    }

    var queryString = G.QS.encode({
      category: category,
      action: action,
      optLabel: optLabel,
      optValue: optValue
    });

    //TODO was here working on analytics need Duggi's stuff here now
    G.Tracker.iframe.src = endpoint + "?" + queryString;

    var result = ['_trackEvent', category, action];
    if (optLabel) result.push(optLabel);
    if (optValue) result.push(optValue);
    if (typeof _gaq != 'undefined') _gaq.push(result);
  },

  trackPageview: function (path) {
    if (typeof _gaq != 'undefined') _gaq.push(['_trackPageview', path]);
  }


});

