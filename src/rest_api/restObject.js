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


G.provide("RestObject", {

  persistenceToken: null,
  appSecret:null,

  init:function() {
    G.models.contribution.init();

  },

  Base:function(rootPath, objectName) {
    var self = this;
    this.requestType = ".json";
    this.rootPath = rootPath;
    this.objectName = objectName;

    /**
     * Base Index call for all RestObject Objects
     */
    this.index = function(params, callback) {
      var path = rootPath + self.requestType;
      params = self.railify(params);
      params = G.RestObject.injectRailsParams(params);
      G.api(path, "get", params, callback);
    };

    /**
     * Base Create call for all RestObject Objects.
     * Automatically pulls out a singular object from the json response
     */
    this.create = function(params, callback) {
      var path = rootPath + self.requestType;
      params = self.railify(params);
      params = G.RestObject.injectRailsParams(params);
      G.api(path, "post", params, function(json, xhr) {
       if(callback) callback(self.stripNamespace(json, xhr), xhr);
      });
    };

    /**
     * Base Read call for all RestObject Objects
     * Automatically pulls out a singular object from the json response
     * 
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    this.read = function(params, callback) {
      var path = rootPath + "/" + (params.id || "undefined") + self.requestType;
      params = self.railify(params);
      params = G.RestObject.injectRailsParams(params);
      G.api(path, "get", params, function(json, xhr) {
        if(callback) callback(self.stripNamespace(json, xhr), xhr);
      });
    };

    /**
     * Base Update call for all RestObject Objects.
     * Per rails convention this call updates and doesn't return the updated model
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    this.update = function(params, callback) {
      var path = rootPath + "/" + (params.id || "undefined") + self.requestType;
      params = self.railify(params);
      params = G.RestObject.injectRailsParams(params);
      G.api(path, "put", params, callback);
    };
    /**
     * Base Destroy call for all RestObject Objects
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    this.destroy = function(params, callback) {
      var path = rootPath + "/" + (params.id || "undefined") + self.requestType;
      params = self.railify(params);
      params = G.RestObject.injectRailsParams(params);
      G.api(path, "delete", params, callback);
    };

    //Is intended only for framework polling
    this.pollOnce = function(params, callback) {
      var path = rootPath + "/poll" + self.requestType;
      params = self.railify(params);
      params = G.RestObject.injectRailsParams(params);
      G.api(path, "get", params, function(json, xhr) {
        if(callback) callback(self.stripNamespace(json, xhr), xhr);
      });
    };

    /**
     * Rails uses a bracket notation to namespace key-value pairs relating
     * to a model. Example : user[:id] where user is the model name and id is
     * the attribute to be sent to the server.
     */
    this.railify = function(params) {
      var rails_params = {};
      for (var key in params) {
        if (key == "id") continue;
        if (key == "poll_ticket") {
          rails_params[key] = params[key];
          continue;// Need to do a better job here
        }
        rails_params[objectName + "[" + key + "]"] = params[key];
      }
      return rails_params;
    };

    this.stripNamespace = function(json, xhr) {
      return (xhr.success) ? json[objectName] : json;
    };


  },

  /**
   * Injects the session token and app key into the params passed in.
   * @param params {Object} Params going to the server without auth tokens
   *
   */
  injectRailsParams: function(params) {
    params = params || {};

    //Set the token only if we have one and the client didn't set it
    if(!params["user[persistence_token]"] && G.RestObject.persistenceToken){
      params["user[persistence_token]"] = G.RestObject.persistenceToken;  
    }

    params['app_key'] = G.appKey;

    //Should only be used while testing
    if (G.RestObject.appSecret)
      params['app_secret'] = G.RestObject.appSecret;

    if (params['app_secret'] && !G.RestObject.appSecret)
      throw "App secret not set using G.RestObject.appSecret";

    return params;
  },

  injectPollTicket: function(params, pollTicket) {
    params.poll_ticket = pollTicket;
    return params;
  }

});


/**
 * Must be called after RestObject has been defined. Done because each property
 * when initialized by javascript is actually a function execution. Could write
 * this without the load order dependency but this is less code to write
 */
G.provide("", {

  user:function() {

    var base = new G.RestObject.Base("/users", "user");

    //We allow a couple convenience functions for logging in users
    function Override() {
      var self = this;

      //TODO this should not be namespaced, instead it should go to our domain
      //and lookup the current session from there
      var cookieName = "__groupit__persistenceToken";

      /**
       * Login is special in that it expects a user object with either the
       * persistenceToken set or the username and password.
       * @param params
       * @param callback
       */
      this.login = function(params, callback) {
        var path = self.rootPath + "/login" + self.requestType;
        params = self.railify(params, self.objectName);
        params = G.RestObject.injectRailsParams(params);
        G.api(path, "post", params, function(json, xhr) {
          json = self.stripNamespace(json, xhr);
          if (xhr.success) {
            G.RestObject.persistenceToken = json.persistence_token;
            G.cookie.setCookie(cookieName, json.persistence_token,
              G.cookie.getExpDate(7, 0, 0), "/");
          }

         if(callback) callback(json, xhr);
        });
      };

      this.logout = function(callback) {
        var params = {}, self = this;

        //Clear the persistenceToken from the client.
        G.RestObject.persistenceToken = null;
        G.cookie.deleteCookie(cookieName, "/");

        //Tell the server to reset the persistenceToken
        var path = self.rootPath + "/logout" + self.requestType;
        params = self.railify(params, self.objectName);
        params = G.RestObject.injectRailsParams(params);
        G.api(path, "post", params, function(json, xhr) {
          if(callback) callback(json, xhr);
        });
      };

      this.currentPersistenceToken = function() {
        var cookieToken = G.cookie.getCookie("__groupit__persistenceToken");
        return G.RestObject.persistenceToken || cookieToken;
      };


      this.isLoggedIn = function() {
        return !!G.RestObject.persistenceToken
      };
    }

    Override.prototype = base;
    return new Override();

  }(),

  paymentResponse:function() {
    return new G.RestObject.Base("/payment_responses", "payment_response");
  }(),

  groupit:function() {
    return new G.RestObject.Base("/groupits", "groupit");
  }(),

  participant:function() {
    return new G.RestObject.Base("/participants", "participant");
  }(),

  note:function() {
    return new G.RestObject.Base("/notes", "note");
  }(),

  feedPost:function() {
    return new G.RestObject.Base("/feed_posts", "feed_post");
  }(),

  email:function() {
    return new G.RestObject.Base("/emails", "email");
  }(),

  authentication:function() {
    return new G.RestObject.Base("/authentications", "authentication");
  }(),

  app:function() {
    return new G.RestObject.Base("/apps", "app");
  }(),

  address:function() {
    return new G.RestObject.Base("/addresses", "address");
  }(),

  //Facades Follow
  invitee:function() {
    var base = new G.RestObject.Base("/invitees", "invitee");

    function Override() {
      delete this.update;
      delete this.read;
      delete this.index;
      delete this.destroy;
    }

    Override.prototype = base;
    return new Override();
  }()

});