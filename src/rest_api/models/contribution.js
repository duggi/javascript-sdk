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

G.provide("", {

  newContribution: function(json) {
    var namespace = G.models.contribution;
    return G.DataObject.commonConstructor(namespace, G.newContribution, json);
  }

});

G.provide("models.contribution", {

  objectName: "contribution",
  path: "/contributions",
  keys: ["groupit_id", "address_id", "amount", "user_id",
    "transaction_id", "surcharge", "payment_response_id", "app_key",
    "is_public", "id", "created_at", "updated_at"],


  /**
   * Base constructor function for the contribution model
   */
  Base:function(json) {
    var self = this;

    this.create = function(config) {
      config = config || {};
      var params = config.params, //TODO need to either add new keys and admit facade or make exception
        newParams = G.dogfort.injectRailsParams({}),
        pollTicket = G.polling.uniqueTicket();

      G.copy(params, self.data()); //Copy the data from self

      //Get the contribution settings
      G.api("/contributions/new.json", "get", newParams, function(json) {
        var brainTreeUrl = json.url,
          tr_data = json.tr_data;

        params = G.dogfort.injectRailsParams(params);
        var braintreeFormParams = self.braintreeParams(tr_data, pollTicket, params);

//        G.log(braintreeFormParams) //Great little debug line

        //Post the contribution to braintree
        G.postViaForm(brainTreeUrl, "post", braintreeFormParams, true);

        //Initialize the polling mechanism to look for the response on the server
        var pollingParams = self.injectPollTicket({}, pollTicket);
        pollForResponse(pollingParams, 0, config);
      });


    };

    function pollForResponse(requestParams, attempts, config) {
      self.pollOnce(requestParams, function(json, xhr) {

        //TODO typeof is a slight hack for ie8's stupid XDR
        var loaded = (xhr.status == "200" || typeof json === 'object'),
          waiting = (xhr.status == "204" || typeof json === 'string');

        if (attempts > 20) { // 20 * .15 = 30 seconds
          var hash = {
            error:{
              message: "After " + attempts + " attempts no contribution was found"
            }
          };
          if (config.error) config.error(hash, xhr);
          if (config.complete) config.complete(hash, xhr);
        } else if (waiting) {//No content means still looking
          continuePolling(1500);
        } else if (loaded) { //JSON should be loaded
          self.extend(json); //namespace stripped in pollOnce
          if (config.success) config.success(self, xhr);
          if (config.complete) config.complete(json, xhr);
        } else {
          if (config.error) config.error(json, xhr);
          if (config.complete) config.complete(json, xhr);
          G.log("Polling returned a unexpected status:" + xhr.status);
        }

        function continuePolling(timeout) {
          setTimeout(function() {
            pollForResponse(requestParams, attempts + 1, config);
          }, timeout);
        }
      });
    }


    //TODO eventually all models will have polling support for ie 7
    //Is intended only for framework polling
    this.pollOnce = function(params, callback) {
      var path = self.objectPath + "/poll" + self.requestType;
      params = G.dogfort.injectRailsParams(params);
      G.api(path, "get", params, function(json, xhr) {
        if (xhr.success) json = self.stripNamespace(json);
        if (callback) callback(json, xhr);
      });
    };

    this.injectPollTicket = function(params, pollTicket) {
      params.poll_ticket = pollTicket;
      return params;
    };

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
    this.braintreeParams = function(tr_data, pollTicket, params) {
      var map = {};

      function mapIfDefined(key, value) {
        if (!value && value != 0) return;
        map[key] = value
      }

      //Passed via the model
      mapIfDefined("tr_data", tr_data);
      mapIfDefined("transaction[custom_fields][poll_ticket]", pollTicket);
      mapIfDefined("transaction[custom_fields][groupit_id]", params.groupit_id);
      mapIfDefined("transaction[custom_fields][user_id]", params.user_id);
      mapIfDefined("transaction[amount]", params.amount);

      //Framework specified
      mapIfDefined("transaction[custom_fields][app_key]", G.appKey);
      mapIfDefined("transaction[custom_fields][session_token]", G.persistenceToken);

      //Passed as user params
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


  }



});