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
    if (!category || !action) {
      G.log("trackEvent requires category and action arguments");
      return;
    }

    // preconstruct
    var pre = {
      'trackevent': category,
      'action': action
    }
    if(optLabel) pre['optlabel'] = optLabel;
    if(optValue) pre['optvalue'] = optValue;

    var qs = G.QS.encode(pre);
    G.Tracker.iframe.src = G.Tracker.endpoint + "?" + qs;
  },


  // -------------------------------------------- TRACK PAGE VIEW
  trackPageview: function (path) {
    if(!path) {
      G.log('trackPageview requires a path argument');
      return;
    }
    var qs = G.QS.encode({
      'trackpageview': path
    });
    G.Tracker.iframe.src = G.Tracker.endpoint + "?" + qs;

  },


  // -------------------------------------------- DOUBLE TRACK
  doubleTrack: function (obj) {
    if(!obj && !obj.trackPageview && !obj.trackEvent) {
      G.log('doubleTrack requires a complete object argument');
      return;
    }

    te = obj.trackEvent;
    tpv = obj.trackPageview;

    // preconstruct here
    var pre = {
      'trackpageview': tpv.path,
      'trackevent': te.category,  // we use category to define partner acct
      'action': te.action
    }
    if(te.optLabel) pre['optlabel'] = te.optLabel;
    if(te.optValue) pre['optvalue'] = te.optValue;

    var qs = G.QS.encode(pre);
    G.Tracker.iframe.src = G.Tracker.endpoint + "?" + qs;
  }

});

