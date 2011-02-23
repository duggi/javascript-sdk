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

/**
 * Basic support for communicating with dogfort! Injection of params and
 * stripping json wrappers.
 *
 */

G.provide("dogfort", {

  /**
   * Injects the session token and app key into the params passed in.
   * @param params {Object} Params going to the server without auth tokens
   * TODO should be renamed to framework params
   */
  injectRailsParams: function(params) {
    params = params || {};

    //Set the token only if we have one and the client didn't set it
    if (!params["user[persistence_token]"] && G.persistenceToken) {
      params["user[persistence_token]"] = G.persistenceToken;
    }

    params['app_key'] = G.appKey;

    //Should only be used while testing
    if (G.appSecret)
      params['app_secret'] = G.appSecret;

    if (params['app_secret'] && !G.appSecret)
      throw "App secret not set using G.RestObject.appSecret";

    return params;
  },

  /**
   * Adds specific association includes to the request
   * @param params
   * @param includes {Object}
   */
  injectIncludes: function(params, includes){


//    params.includes =
//    for(var key in para)
    
  },

  //TODO this isn't used yet, is it needed?
  injectPollTicket: function(params, pollTicket) {
    params.poll_ticket = pollTicket;
    return params;
  }

});