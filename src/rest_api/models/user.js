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
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

G.provide("", {

  newUser: function(json) {
    var namespace = G.models.user;
    return G.DataObject.commonConstructor(namespace, G.newContribution, json);
  }

});

G.provide("models.user", {

  objectName: "user",
  path: "/users",
  //TODO password really doesn't belong.
  keys: ["name", "login", "organized_before", "is_public", "id", "created_at",
    "updated_at", "name", "password", "persistence_token", "single_access_token"],

  Base: function() {
    var self = this;
    var cookieName = "__groupit__persistenceToken"; //TODO do XD cookies

    //Add the authd key and listeners
    self.extend(["authd"]);
    /**
     * Login is special in that it expects a user object with either the
     * persistenceToken set or the username and password.
     * @param config
     *
     * config is a hash. We support success, and error keys
     */
    self.signin = function(config) {
      config = config || {};
      var path = self.objectPath + "/login" + self.requestType;
      var params = self.data();
      params = self.railify(params, self.objectName);
      params = G.dogfort.injectRailsParams(params);
      G.api(path, "post", params, function(json, xhr) {
        if (xhr.success) {
          json = self.stripNamespace(json, xhr);

          //Setup the cookies
          G.persistenceToken = json.persistence_token;
          G.cookie.setCookie(cookieName, json.persistence_token,
            G.cookie.getExpDate(7, 0, 0), "/");

          //Update the model
          self.extend(json);
          self.authd(true);

          //Let the world know
          if (config.success) config.success(self, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    };

    /**
     * Logout resets the persistence token on the server, clears the cookie,
     * and the token stored in memory.
     *
     * @param config
     */

    self.signout = function(config) {
      config = config || {};
      var params = {}, self = this;

      //Clear the persistenceToken from the client.
      G.persistenceToken = null;
      G.cookie.deleteCookie(cookieName, "/");

      //TODO what happens to self? Should we delete everything?
      //Update the model
      self.authd(false);
      //TODO need to get a list of getters and setters or define a clear function
      self.name("");
      self.login("");
      self.persistenceToken("");


      //Tell the server to reset the persistenceToken
      var path = self.objectPath + "/logout" + self.requestType;
      params = G.dogfort.injectRailsParams(params);
      G.api(path, "post", params, function(json, xhr) {
        if (xhr.success) {
          if (config.success) config.success(self, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    };

    //Send the reset password email for this user
    self.resetPasswordEmail = function(config) {
      config = config || {};
      var self = this,
        path = self.objectPath + "/reset_password_email" + self.requestType,
        params = self.data();

      //setup the params for sending to api
      params = self.railify(params, self.objectName);
      params = G.dogfort.injectRailsParams(params);

      //post and handle response
      G.api(path, "post", params, function(json, xhr) {
        if (xhr.success) {
          if (config.success) config.success(self, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    };

    //Allows client to check for persistenceToken presence
    self.currentPersistenceToken = function() {
      var cookieToken = G.cookie.getCookie(cookieName);
      return G.persistenceToken || cookieToken;
    };


  }

});