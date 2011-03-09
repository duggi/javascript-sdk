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
  endpoint: "http://analytics.groupit.com", // TODO need https support on this domain
  accountToken: null,                       // TODO support accountToken


  // -------------------------------------------- INIT
  init: function() {
    G.Tracker.iframe = G.ApiClient.createHiddenIframe();
    G.log('tracker inited');
  },


  // -------------------------------------------- TRACK EVENT
  trackEvent: function (category, action, optLabel, optValue) {
    //accountToken = accountToken || G.Tracker.accountToken; TODO abstract for general use
    //                                                            should be checked in init, not here
    if (!category || !action) {
      G.log("trackEvent requires category and action arguments");
      return;
    }

    var qs = G.QS.encode({
      'ga': 'trackEvent',
      'category': category,
      'action': action,
      'optLabel': optLabel,
      'optValue': optValue
    });

    G.Tracker.iframe.src = G.Tracker.endpoint + "?" + qs; // TODO abstract to allow batching

/*
    var result = ['_trackEvent', category, action];
    if (optLabel) result.push(optLabel);
    if (optValue) result.push(optValue);
    if (typeof _gaq != 'undefined') _gaq.push(result);
*/
  },


  // -------------------------------------------- TRACK PAGE VIEW
  trackPageview: function (path) {
    if(!path) {
      G.log('trackPageview requires a path argument');
    }

    var qs = G.QS.encode({
      'ga': 'trackPageview',
      'path': path
    });
    G.Tracker.iframe.src = G.Tracker.endpoint + "?" + qs; // TODO abstract to allow batching

    //if (typeof _gaq != 'undefined') _gaq.push(['_trackPageview', path]);
  }

});

