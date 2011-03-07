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

    //TODO Overridden name conversion... don't like this feel
    bo.nameConversion = function(name) {
      return G.String.toCamelCase(name);
    };

    var base = new G.DataObject.Base(objectPath, objectName, constructorFn);
    //overridden methods work here
    base.extend(keys);
    return base;
  }

});

//Extension of the Bindable Object
G.provide("DataObject", {

  apiObjects: {
    payment_response: {
      path: "/payment_responses",
      keys:["user_id", "groupit_id", "ip_address", "success", "response",
        "is_public", "id","created_at", "updated_at"]
    },
    //TODO need to create the user attribute everywhere and remove from groupit index
    participant: {
      path: "/participants",
      //TODO need to do inverntory on keys (organizer, ... etc)
      keys: ["groupit_id", "contacted", "is_public", "user_id", "id",
        "created_at", "updated_at", "invited", "organizer", "contributor"]
    },
    invitee: { //TODO this is a index action... facades ugh
      path: "/invitees",
      keys: []
    },
    note: {
      path:"/notes",
      keys: ["note", "metadata_id", "metadata_type", "is_public", "user_id",
        "id", "created_at", "updated_at", "name"]
    },
    feed_post: {
      path:"/feed_posts",
      keys: ["message", "groupit_id", "is_public", "user_id", "id",
        "created_at", "updated_at"]
    },
    authentication: {
      path: "/authentications",
      keys: ["user_id", "provider", "uid", "is_public", "id",
        "created_at", "updated_at"]
    },
    app: {
      path: "/apps",
      keys: ["name", "user_id", "is_public", "id", "created_at", "updated_at", "key"]
    },
    address: {
      path: "/addresses",
      keys: ["fullname", "line1", "line2", "city", "state", "zip", "country",
        "phone_number", "user_id", "is_public", "id", "created_at",
        "updated_at"]
    }
  },

  defaultRequestType: ".json",

  /**
   * Common constructor for all our api objects.
   *
   * Namespace must include a restful path, a objectName, the keys available
   * in underscore type, and a Base constructor fn
   *
   * @param namespace {Object}
   * @param constructorFn {Function} the wrapper function that calls this fn.
   * @param json
   */
  commonConstructor: function(namespace, constructorFn, json) {
    var ns = namespace;
    var dataObj = G.newDataObject(ns.path, ns.objectName, constructorFn, ns.keys);
    ns.Base.prototype = dataObj;
    var base = new ns.Base();
    if (json) base.extend(json);
    return base;
  },

  commonIndex: function(config, namespace, constructorFn, params, callback) {
    config = config || {};
    params = params || {};
    var path = namespace.path + G.DataObject.defaultRequestType,
      name = namespace.objectName;

    //Converts the camel cased names to underscores for the server
    for (var key in config.params) {
      params[G.String.toUnderscore(key)] = config.params[key];
    }
    params = G.dogfort.injectRailsParams(params);

    G.api(path, "get", params, function(json, xhr) {
      if (xhr.success) {
        var models = [];
        for (var i in json) {
          //TODO need to do a proper strip namespace
          models.push(constructorFn(json[i][name]));
        }
        callback(models);
        if (config.success) config.success(models, xhr);
      } else {
        if (config.error) config.error(json, xhr);
      }
      if (config.complete) config.complete(json, xhr);
    });
  },

  init: function() {
    //Injecting the api object constructors into the G namespace
    for (var key in G.DataObject.apiObjects) {
      (function() { //Done for the function declarations inside
        var name = key,
          path = G.DataObject.apiObjects[name].path,
          keys = G.DataObject.apiObjects[name].keys;

        //Fixup the constructor name
        var camelCased = G.String.toCamelCase(name),
          capName = camelCased.charAt(0).toUpperCase() + camelCased.slice(1),
          constructorName = "new" + capName;

        //Define the constructor
        G[constructorName] = function(json) {
          var base = G.newDataObject(path, name, G[constructorName], keys);
          //overridden methods work here
          if (json) base.extend(json);
          return base;
        };


        /**
         * Config object is a hash. We currently support the following keys
         *
         * success
         * error
         * complete
         * offset
         * limit
         *
         * @param config
         */
        G[capName] = G[capName] || {};
        G[capName].index = function(config) {
          config = config || {};
          var params = {};
          //Converts the camel cased names to underscores for the server
          for (var key in config.params) {
            params[G.String.toUnderscore(key)] = config.params[key];
          }

          params = G.dogfort.injectRailsParams(params);
          //TODO path need to be cleaned up
          G.api(path + ".json", "get", params, function(json, xhr) {
            if (xhr.success) {
              var models = [];
              for (var i in json) {
                //TODO need to do a proper strip namespace
                models.push(G[constructorName](json[i][name]));
              }
              if (config.success) config.success(models, xhr);
            } else {
              if (config.error) config.error(json, xhr);
            }
            if (config.complete) config.complete(json, xhr);
          });
        }
      })();
    }
  },

  Base: function(objectPath, objectName, constructorFn) {
    var self = this;
    self.requestType = G.DataObject.defaultRequestType;
    self.objectPath = objectPath;
    self.objectName = objectName;
    self.constructorFn = constructorFn;

    //--------------------------------------------- API CALLS

    /**
     * Create takes a hash of configuration options
     *
     * success, error, complete are supported
     *
     * @param config
     */

    self.create = function(config) {
      config = config || {};
      var path = objectPath + self.requestType;
      var params = self.data();
      params = self.railify(params);
      if (config.params) G.copy(params, config.params, true); //TODO need to convert to underscore!
      params = G.dogfort.injectRailsParams(params);
      G.api(path, "post", params, function(json, xhr) {
        if (xhr.success) {
          self.extend(self.stripNamespace(json));
          if (config.success) config.success(self, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    };

    /**
     * Base Read call for all RestObject Objects
     * Automatically pulls out a singular object from the json response
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    self.read = function(config) {
      config = config || {};
      var params = self.data(),
        path = objectPath + "/" + (params.id || "undefined") + self.requestType;

      params = self.railify(params);
      params = G.dogfort.injectRailsParams(params);
      G.api(path, "get", params, function(json, xhr) {
        if (xhr.success) {
          self.extend(self.stripNamespace(json));
          if (config.success) config.success(self, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    };

    /**
     * Base Update call for all RestObject Objects.
     * Per rails convention this call updates and doesn't return the updated model
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    self.update = function(config) {
      config = config || {};
      var params = self.data(),
        path = objectPath + "/" + (params.id || "undefined") + self.requestType;

      params = self.railify(params);
      params = G.dogfort.injectRailsParams(params);
      G.api(path, "put", params, function(json, xhr) {
        if (xhr.success) {
          //Update doesn't return the object
          if (config.success) config.success(json, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    };
    /**
     * Base Destroy call for all RestObject Objects
     *
     * Undefined is the key word to bypass id based lookup and fallback to
     * other methods like hashes
     */
    self.destroy = function(config) {
      config = config || {};
      var params = self.data(),
        path = objectPath + "/" + (params.id || "undefined") + self.requestType;

      params = self.railify(params);
      params = G.dogfort.injectRailsParams(params);
      G.api(path, "delete", params, function(json, xhr) {
        if (xhr.success) {
          //Destroy doesn't return the object
          if (config.success) config.success(json, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    };

    /**
     * Rails uses a bracket notation to namespace key-value pairs relating
     * to a model. Example : user[:id] where user is the model name and id is
     * the attribute to be sent to the server.
     */
    self.railify = function(params) {
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

    self.stripNamespace = function(json) {
      return json[self.objectName];
    };
  }

});

























