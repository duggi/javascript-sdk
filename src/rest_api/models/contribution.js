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
 * Models are instantiated in RestObject in restObject.js
 */

G.provide("", {
  //public handle 
  contribution:null
});

G.provide("models.contribution", {

  init:function() {
    var base = new G.RestObject.Base("/contributions", "contribution");
    G.models.contribution.Base.prototype = base;
    G.contribution = new G.models.contribution.Base();
  },

  /**
   * Base constructor function for the contribution model
   */
  Base:function() {
    this.create = function(params, callback) {
      var newParams = G.RestObject.injectRailsParams({}),
        pollTicket = G.polling.randomTicket();

      //Get the contribution settings
      G.api("/contributions/new", "get", newParams, function(json) {
        var brainTreeUrl = json.url,
          tr_data = json.tr_data,
          c = G.models.contribution;

        params = G.RestObject.injectRailsParams(params);
        var braintreeFormParams = c.braintreeParams(tr_data, pollTicket, params);

        //Post the contribution to braintree
        G.postViaForm(brainTreeUrl, "post", braintreeFormParams, true);

        //Initialize the polling mechanism to look for the response on the server
        var pollingParams = G.RestObject.injectPollTicket({}, pollTicket);
        pollForResponse(pollingParams, 0);
      });

      function pollForResponse(requestParams, attempts) {
        G.contribution.pollOnce(requestParams, function(json, xhr) {
          if (attempts > 10) {
            var hash = {
              error:{
                message: "After " + attempts + " attempts no contribution was found"
              }
            };
            if (callback) callback(hash, xhr);
          } else if (xhr.status == "204") {//No content means still looking
            continuePolling(1500);
          } else if (xhr.status == "200") { //JSON should be loaded
            if (callback) callback(json, xhr);
          } else {
            G.log("Polling returned a unexpected status:" + xhr.status);
          }

          function continuePolling(timeout) {
            setTimeout(function() {
              pollForResponse(requestParams, attempts + 1);
            }, timeout);
          }
        });
      }
    };
  },

  /**
   * Takes a list of params and converts them into the braintree format for
   * processing.
   *
   * @param tr_data     {Object} Braintree configuration
   * @param pollTicket  {String} Hash that we use to poll for a response
   * @param params      {Object} Should be a object
   *                                   with the following structure:
   *
   * params = {
   *   amount:
   *   groupitId:
   *   userId:
   *   customer: {},
   *   cc:{},
   *   billing:{}
   * }
   *
   * customer has the following fields:
   *   firstName
   *   lastName
   *   email
   *
   * cc has the following fields:
   *   cardholderName: Must exactly match the name on the card
   *   number
   *   ccv
   *   month
   *   year
   *
   * billing has the following fields:
   *   firstName
   *   lastName
   *   address1 : first line of the address fields
   *   address2: second line of the address fields
   *   locality
   *   region
   *   postalCode
   *   countryCode : Must be in the ISO Standard format
   *   phone
   *
   * We also inject app_key and session token at the base for you
   *
   */
  braintreeParams:function(tr_data, pollTicket, params) {
    var map = {};

    function mapIfDefined(key, value) {
      if (!value && value != 0) return;
      map[key] = value
    }

    mapIfDefined("tr_data", tr_data);
    mapIfDefined("transaction[custom_fields][poll_ticket]", pollTicket);
    mapIfDefined("transaction[custom_fields][groupit_id]", params.groupitId);
    mapIfDefined("transaction[custom_fields][user_id]", params.userId);
    mapIfDefined("transaction[custom_fields][app_key]", params.app_key);
    mapIfDefined("transaction[custom_fields][session_token]", params.session_token);
    mapIfDefined("transaction[amount]", params.amount);
    mapIfDefined("transaction[customer][first_name]", params.customer.firstName);
    mapIfDefined("transaction[customer][last_name]", params.customer.lastName);
    mapIfDefined("transaction[customer][email]", params.customer.email);
    mapIfDefined("transaction[credit_card][cardholder_name]", params.cc.cardholderName);
    mapIfDefined("transaction[credit_card][number]", params.cc.number);
    mapIfDefined("transaction[credit_card][cvv]", params.cc.cvv);
    mapIfDefined("transaction[credit_card][expiration_month]", params.cc.month);
    mapIfDefined("transaction[credit_card][expiration_year]", params.cc.year);
    mapIfDefined("transaction[billing][first_name]", params.billing.firstName);
    mapIfDefined("transaction[billing][last_name]", params.billing.lastName);
    mapIfDefined("transaction[billing][street_address]", params.billing.address1);
    mapIfDefined("transaction[billing][extended_address]", params.billing.address2);
    mapIfDefined("transaction[billing][locality]", params.billing.locality);
    mapIfDefined("transaction[billing][region]", params.billing.region);
    mapIfDefined("transaction[billing][postal_code]", params.billing.postalCode);
    mapIfDefined("transaction[billing][country_code_alpha2]", params.billing.countryCode);
    mapIfDefined("transaction[customer][phone]", params.billing.phone);
    return map;
  }
});