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
 * This module is the successor to the restObject.
 * Note:the G level methods are injected at G initialization in the init method
 */

G.provide("", {

  newDataObject: function(objectPath, objectName, constructorFn, keys) {
    var bo = G.newBindableObject();
    G.DataObject.Base.prototype = bo;
    var base = new G.DataObject.Base(objectPath, objectName, constructorFn);
    //overridden methods work here
    base.extend(keys);
    return base;
  }

});

//Extension of the Bindable Object
G.provide("DataObject", {

  apiObjects: {
    groupit: {
      path: "/groupits",
      //TODO need to do inventory on the keys returned from the server
      keys: ["id", "product_image", "product_url", "product", "price",
        "message", "surprise", "quantity","user_id","recipient", "options",
        "active", "lead_url", "support_url", "purchased", "groupit_type",
        "created_at", "updated_at", "hash_digest", "organizer", "amount_raised"]
    },
    payment_response: {
      path: "/payment_responses",
      keys:["user_id", "groupit_id", "ip_address", "success", "response",
        "is_public", "id","created_at", "updated_at"]
    },
    participant: {
      path: "/participants",
      keys: ["groupit_id", "contacted", "is_public", "user_id", "id",
        "created_at", "updated_at", "invited"]
    },
    invitee: { //TODO this is a index action... facades ugh
      path: "/invitees",
      keys: []
    },
    note: {
      path:"/notes",
      keys: ["note", "metadata_id", "metadata_type", "is_public", "user_id",
        "id", "created_at", "updated_at"]
    },
    feed_post: {
      path:"/feed_posts",
      keys: ["message", "groupit_id", "is_public", "user_id", "id",
        "created_at", "updated_at"]
    },
    email: {
      path: "/emails",
      keys: ["address", "primary", "user_id", "retail_contact", "id",
        "created_at", "updated_at"]
    },
    authentication: {
      path: "/authentications",
      keys: ["user_id", "provider", "uid", "is_public", "id",
        "created_at", "updated_at"]
    },
    app: {
      path: "/apps",
      keys: ["name", "user_id", "is_public", "id", "created_at", "updated_at"]
    },
    address: {
      path: "/addresses",
      keys: ["fullname", "line1", "line2", "city", "state", "zip", "country",
        "phone_number", "user_id", "is_public", "id", "created_at",
        "updated_at"]
    }
  },

  init: function() {
    //Injecting the api object constructors into the G namespace
    for (var name in G.DataObject.apiObjects) {
      (function() {
        var path = G.DataObject.apiObjects[name].path,
          keys = G.DataObject.apiObjects[name].keys;

        //camelCase the keys
        keys = G.Array.map(keys, G.String.toCamelCase);

        //Fixup the constructor name
        var constructorName = G.String.toCamelCase(name);
        constructorName = "new" + constructorName[0].toUpperCase() + constructorName.slice(1);

        //Define the constructor
        G[constructorName] = function(json) {
          var bo = G.newBindableObject();
          G.DataObject.Base.prototype = bo;
          var base = new G.DataObject.Base(path, name, G[constructorName]);
          //overridden methods work here
          base.extend(keys);
          if (json) base.extend(json);
          return base;
        };

      })();
    }

  },

  Base: function(objectPath, objectName, constructorFn) {
    var self = this;
    this.requestType = ".json";
    this.objectPath = objectPath;
    this.objectName = objectName;
    this.constructorFn = constructorFn;

    //-------------------------------------- OVERRIDDEN BINDABLE OBJECT METHODS
    //Formats the callbacks/getters/setters in JavaScript camelCase conventions
    this.nameConversion = function(name) {
      return G.String.toCamelCase(name);
    };

    //--------------------------------------------- API CALLS

    /**
     * Config object is a hash. We currently support the following keys
     *
     * success
     * error
     * complete
     * offset
     * limit
     *
     * TODO this is a speical case and should be used in a class method manner
     * @param config
     */

    this.index = function(config) {
      config = config || {};
      var path = objectPath + self.requestType;
      var params = {};
      if (config.offset) params.offset = config.offset;
      if (config.limit) params.limit = config.limit;

      //TODO migrate that function here
      params = self.injectRailsParams(params);
      G.api(path, "get", params, function(json, xhr) {
        if (xhr.success) {
          var groupits = [];
          for (var i in groupits) {
            groupits.push(self.constructorFn(groupits[i].groupit));
          }
          if (config.success) config.success(groupits, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if(config.complete) config.complete(json, xhr);
      });
    };

    /**
     * Also takes a hash of configuration options
     *
     * success and error are supported
     *
     * @param config
     */

    this.create = function(config) {
      config = config || {};
      var path = objectPath + self.requestType;
      var params = self.data();
      params = self.railify(params);
      params = self.injectRailsParams(params);
      G.api(path, "post", params, function(json, xhr) {
        if (xhr.success && config.success) {
          self.extend(self.stripNamespace(json));
          config.success(self, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if(config.complete) config.complete(json, xhr);
      });
    };

    /**
     * Base Read call for all RestObject Objects
     * Automatically pulls out a singular object from the json response
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    this.read = function(config) {
      config = config || {};
      var params = self.data(),
        path = objectPath + "/" + (params.id || "undefined") + self.requestType;

      params = self.railify(params);
      params = self.injectRailsParams(params);
      G.api(path, "get", params, function(json, xhr) {
        if (xhr.success && config.success) {
          json = self.stripNamespace(json);
          config.success(self.constructorFn(json), xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if(config.complete) config.complete(json, xhr);
      });
    };

    /**
     * Base Update call for all RestObject Objects.
     * Per rails convention this call updates and doesn't return the updated model
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    this.update = function(config) {
      config = config || {};
      var params = self.data(),
        path = objectPath + "/" + (params.id || "undefined") + self.requestType;

      params = self.railify(params);
      params = self.injectRailsParams(params);
      G.api(path, "put", params, function(json, xhr) {
        if (xhr.success && config.success) {
          //Update doesn't return the object
          config.success(json, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if(config.complete) config.complete(json, xhr);
      });
    };
    /**
     * Base Destroy call for all RestObject Objects
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    this.destroy = function(config) {
      config = config || {};
      var params = self.data(),
        path = objectPath + "/" + (params.id || "undefined") + self.requestType;

      params = self.railify(params);
      params = self.injectRailsParams(params);
      G.api(path, "delete", params, function(json, xhr) {
        if (xhr.success && config.success) {
          //Destroy doesn't return the object
          config.success(json, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if(config.complete) config.complete(json, xhr);
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

    this.stripNamespace = function(json) {
      return json[self.objectName];
    };


    /**
     * Injects the session token and app key into the params passed in.
     * @param params {Object} Params going to the server without auth tokens
     *
     */
    this.injectRailsParams = function(params) {
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
    };

  }

});

























