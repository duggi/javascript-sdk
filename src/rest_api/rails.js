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


G.provide("restfulRails",{

  sessionToken: null,

  Base:function(root_path, object_name){
    var request_type = ".json"

    /**
     * Base Index call for all restfulRails Objects
     */
    this.index = function(params, callback){
      var path = root_path + request_type;
      params = injectSessionToken(params);
      G.api(path , "get", params, callback);
    }

    /**
     * Base Create call for all restfulRails Objects.
     * Automatically pulls out a singular object from the json response
     */
    this.create = function(params, callback){
      var path = root_path + request_type;
      params = railify(params,object_name);
      params = injectSessionToken(params);
      G.api(path, "post", params, function(json, xhr){
        if(callback){
          callback(json[object_name], xhr);
        }
      });
    }

    /**
     * Base Read call for all restfulRails Objects
     */
    this.read = function(params, callback){
      var path = root_path+"/"+params.id+ request_type;
      params = injectSessionToken(params);
      G.api(path, "get", params, callback);
    }

    /**
     * Base Update call for all restfulRails Objects.
     * Automatically pulls out a singular object from the json response
     */
    this.update = function(params, callback){
      var path = root_path +"/"+params.id+ request_type,
      params_cp = {};
      G.copy(params_cp, params); //Make a copy so we don't modify the orginal
      delete params_cp.id; //remove id so we don't try to modify it
      params_cp = railify(params_cp,object_name);
      params_cp = injectSessionToken(params_cp);
      G.api(path, "put", params_cp, function(json, xhr){
        if(callback){
          callback(json[object_name], xhr);
        }
      });
    }
    /**
     * Base Destroy call for all restfulRails Objects
     */
    this.destroy = function(params, callback){
      var path = root_path +"/"+params.id+ request_type;
      params = injectSessionToken(params);
      G.api(path, "delete", params, callback);
    }

    /**
     * Rails uses a bracket notation to namespace key-value pairs relating
     * to a model. Example : user[:id] where user is the model name and id is
     * the attribute to be sent to the server.
     */
    function railify(params, object_name){
      var rails_params = {};
      for(var key in params){
        rails_params[object_name+"["+key+"]"] = params[key];
      }
      return rails_params;
    }

    function injectSessionToken(params){
      params['session_token'] = G.restfulRails.sessionToken;
      return params;
    }

  }

});


/**
 * Must be called after restfulRails has been defined. Done because each property
 * when initialized by javascript is actually a function execution. Could write
 * this without the load order dependency but this is less code to write
 */
G.provide("",{

  user:function(){
    //We allow a couple convience functions for logging in users
    function override(){
      this.login = function(params, callback){
        G.userSession.create(params, callback);
      }

      this.logout = function(params, callback){
        G.userSession.destroy(params, callback);
      }
      
    }
    override.prototype = new G.restfulRails.Base("/users", "user");
    ;

    return new override();
  }(),

  groupit:function(){
    return new G.restfulRails.Base("/groupits", "groupit");
  }(),
  
  userSession:function(){

    var base = new G.restfulRails.Base("/user_sessions", "user_session");

    function override(){
      this.create = function(params, callback){
        base.create(params, function(userSession, xhr){
          G.restfulRails.sessionToken = userSession.token;
          if(callback){
            callback(userSession, xhr);
          }
        });
      }

      delete this.update;
      delete this.read;
      delete this.index;
      
      this.destroy = function(params, callback){
        G.restfulRails.sessionToken = null;
        params = {
          id:0 //Simple hack to make rails route correctly
        }
        base.destroy(params, callback);
      }
    }
    
    override.prototype = base;

    return new override();
  }(),

  participant:function(){
    return new G.restfulRails.Base("/participants", "participant");
  }(),

  paymentResponse:function(){
    return new G.restfulRails.Base("/payment_responses", "payment_response");
  }(),

  note:function(){
    return new G.restfulRails.Base("/notes", "note");
  }(),

  feedPost:function(){
    return new G.restfulRails.Base("/feed_posts", "feed_post");
  }(),

  email:function(){
    return new G.restfulRails.Base("/emails", "email");
  }(),

  contribution:function(){
    return new G.restfulRails.Base("/contributions", "contribution");
  }(),

  authentication:function(){
    return new G.restfulRails.Base("/authentications", "authentication");
  }(),
  
  app:function(){
    return new G.restfulRails.Base("/apps", "app");
  }(),

  address:function(){
    return new G.restfulRails.Base("/addresses", "address");
  }()

});