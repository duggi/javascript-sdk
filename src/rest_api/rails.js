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

  Base:function(root_path, request_type, object_name){

    /**
     * Base Index call for all restfulRails Objects
     */
    this.index = function(params, callback){
      var path = root_path + request_type;
      G.api(path , "get", params, callback);
    }

    /**
     * Base Create call for all restfulRails Objects.
     * Automatically pulls out a singular object from the json response
     */
    this.create = function(params, callback){
      var path = root_path + request_type;
      G.api(path, "post", railify(params,object_name), function(json, xhr){
        callback(json[object_name], xhr);
      });
    }

    /**
     * Base Read call for all restfulRails Objects
     */
    this.read = function(params, callback){
      G.api(root_path, "get", params, callback);
    }

    /**
     * Base Update call for all restfulRails Objects.
     * Automatically pulls out a singular object from the json response
     */
    this.update = function(object_params, std_params, callback){
      var path = root_path +"/"+object_params.id+ request_type,
      params = G.copy(railify(object_params,object_name), std_params);
      G.api(path, "put", params, function(json, xhr){
        callback(json[object_name], xhr);
      });
    }
    /**
     * Base Destroy call for all restfulRails Objects
     */
    this.destroy = function(params, callback){
      var path = root_path +"/"+params.id+ request_type;
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

  }

});


/**
 * Must be called after restfulRails has been defined. Done because each property
 * when initialized by javascript is actually a function execution. Could write
 * this without the load order dependency but this is less code to write
 */
G.provide("",{


  user:function(){
    return new G.restfulRails.Base("/users", ".json", "user");
  }(),
  gift:function(){
    return new G.restfulRails.Base("/gifts", ".json", "gift");
  }(),
  userSession:function(){

    function override(){
      delete this.update;
      delete this.read;
      delete this.index;
    }

    override.prototype = new G.restfulRails.Base("/user_sessions", ".json", "user_session");

    return new override();
  }()

});