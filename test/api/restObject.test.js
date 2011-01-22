(function(){

  /**
   * Tests the CRUD suite.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param keys      {Array}          list of keys required to be accessible in
   *                                    the returned object
   * @param createFn  {Function}       function that creates and returns model
   */
  
  T.testCRUD = function(modelName, keys, createFn){
    T.testDestroy(modelName, createFn);
    T.testCreate(modelName, keys, createFn);
    T.testShow(modelName, keys, createFn);
    T.testUpdate(modelName, createFn);
  }


  /**
   * Tests the destroy call to the server.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param createFn  {Function}       function that creates and returns model
   */
  T.testDestroy = function(modelName, createFn){
    asyncTest("Destroy "+modelName, function(){
      T.loginTestUser(function(){
        //Create the model
        createFn(function(model){
          var params ="{id:"+model.id+"}"
          eval("G."+modelName+".destroy("+params+",afterDestroy)");

          function afterDestroy(){
            //Can't read a deleted item
            eval("G."+modelName+".read("+params+", fail)");
          }

          function fail(model,xhr){
            T.assert_failure(xhr);
            start();
          }
        });
      });
    });
  }

  /**
   * Tests the create call to the server.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param keys      {Array}          list of keys required to be accessible in 
   *                                    the returned object
   * @param createFn  {Function}       function that creates and returns model
   */
  T.testCreate = function(modelName, keys, createFn){
    asyncTest("Create new "+modelName, function(){
      T.loginTestUser(function(){
        createFn(function(model){
        
          assert_keys(model, keys);
          var params ="{id:"+model.id+"}"

          eval("G."+modelName+".destroy("+params+", logout)");

          function logout(){
            start();
          }
        });
      });
    });
  }


  /**
   * Tests the show call to the server.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param keys      {Array}          list of keys required to be accessible in
   *                                    the returned object
   * @param createFn  {Function}       function that creates and returns model
   */
  T.testShow = function(modelName, keys, createFn){
    asyncTest("Show "+modelName, function(){
      T.loginTestUser(function(){
        createFn(function(model){
          var params ="{id:"+model.id+"}"

          eval("G."+modelName+".read("+params+",assertAndDestroy)")

          function assertAndDestroy(){
            assert_keys(model, keys);
            eval("G."+modelName+".destroy("+params+", logout)");
          }

          function logout(){
            start();
          }
        });
      });
    });
  }

  /**
   * Tests the Update call to the server.
   *
   * Anything that is not the id or the persitance token is taken and updated.
   * We check that those updates persist in the returned object.
   *
   * #TODO need to add the app_key to the that list of non editable objects OR
   * just not return it from the default create function
   *
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param createFn  {Function}       function that creates and returns model
   */
  T.testUpdate = function(modelName, createFn){
    asyncTest("Update existing user", function(){
      T.loginTestUser(function(){
        createFn(function(original_model){
          var testString ="someString",
          testNum = 1234;

          params = "{"
          //Changes the user around
          for(var key in original_model){
            if(key == "id" || key == "persistence_token"){
              params += key+":'"+original_model[key]+"'";
            }
            else if(isNaN(original_model[key])){
              params += key+":'"+testString+"'";
            }else{
              params += key+":"+testNum;
            }
            params += ","
          }

          params = params.slice(0, params.length-1);
          params += "}";

          eval("G."+modelName+".update("+params+", assertAndDestroy)");

          function assertAndDestroy(model, xhr){
            T.assert_success(xhr);

            for(var key in model){
              var value = model[key];
              if(isNaN(value)){
                equal(value, testString, value+" should be "+ testString);
              }else{
                equal(value, testNum, value+" should be "+ testNum);
              }
            }

            var params ="{id:"+original_model.id+"}"
            eval("G."+modelName+".destroy("+params+", logout)");

            function logout(){
              start();
            }
          }
        });
      });
    });
  }
 

  T.getTestUser = function(callback){
    T.getTestUser.callbacks = T.getTestUser.callbacks || [];

    if(T.getTestUser.user) {
      callback(T.getTestUser.user);
      return;
    }
    else if(!T.getTestUser.called){
      T.getTestUser.called = true;
      G.user.create({
        name:"Tim Test",
        login:"test",
        password:"password",
        password_confirmation: "password"
      }, function(user, xhr){
        T.getTestUser.user = user;
        for(var i in T.getTestUser.callbacks){
          T.getTestUser.callbacks[i](T.getTestUser.user);
        }
      });
    }

    T.getTestUser.callbacks.push(callback);
  }

  T.destroyTestUser = function(){
    T.getTestUser(function(user){
      G.user.destroy({
        id:user.id
      });
    });
  }

  T.loginTestUser = function(callback){
    T.getTestUser(function(){
      G.user.login({
        password:"password",
        login:"test"
      }, callback);
    });
  }

  T.logoutTestUser = function(callback){
    G.user.logout(callback);
  }




  //  T.createUserAndLogin = function (login, callback){
  //    G.user.create({
  //      name:"Tim Test",
  //      login:"test",
  //      password:"password",
  //      password_confirmation: "password",
  //      app_key : "060f13390ecab0dd28dc6faf684632fe"
  //    }, function(user, xhr){
  //      T.assert_success(xhr);
  //
  //      if(login){
  //        G.user.login({
  //          password:"password",
  //          login:"test"
  //        }, function(){
  //          callback(user, xhr);
  //        });
  //      }
  //      else{
  //        callback(user, xhr);
  //      }
  //
  //    });
  //  }
  //
  //  function destroyUserAndLogout(userId, loggedIn, callback){
  //    G.user.destroy({
  //      id:userId
  //    },
  //    function() {
  //      if(loggedIn){
  //        G.user.logout();
  //      }
  //    });
  //  }

  function assert_keys(model, keys){
    //Expected nonnull keys for new users
    for(var i=0, len=keys.length; i < len; ++i){
      var key = keys[i];
      ok(key in model, key + " is a key in user hash");
    }
  }

})();