(function(){

  /**
   * Tests the CRUD suite.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param keys      {Array}          list of keys required to be accessible in
   *                                    the returned object
   * @param createFn  {Function}       function that creates and returns model
   * @param login     {Boolean}        if we should login a valid user or not
   */
  
  T.testCRUD = function(modelName, keys, createFn, login){
    T.testDestroy(modelName, createFn, login);
    T.testCreate(modelName, keys, createFn, login);
    T.testShow(modelName, keys, createFn, login);
    T.testUpdate(modelName, createFn, login);
  }


  /**
   * Tests the destroy call to the server.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param createFn  {Function}       function that creates and returns model
   * @param login     {Boolean}        if we should login a valid user or not
   */
  T.testDestroy = function(modelName, createFn, login){
    asyncTest("Destroy "+modelName, function(){
      createUserAndLogin(login, function (user){

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
            destroyUserAndLogout(user.id, login);
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
   * @param login     {Boolean}        if we should login a valid user or not
   */
  T.testCreate = function(modelName, keys, createFn, login){
    asyncTest("Create new "+modelName, function(){
      createUserAndLogin(login, function (user){
        createFn(function(model){

          assert_keys(model, keys);
          var params ="{id:"+model.id+"}"

          eval("G."+modelName+".destroy("+params+", logout)");

          function logout(){
            destroyUserAndLogout(user.id, login);
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
   * @param login     {Boolean}        if we should login a valid user or not
   */
  T.testShow = function(modelName, keys, createFn, login){
    asyncTest("Show "+modelName, function(){
      createUserAndLogin(login, function(user){
        createFn(function(model){
          var params ="{id:"+model.id+"}"

          eval("G."+modelName+".read("+params+",assertAndDestroy)")

          function assertAndDestroy(){
            assert_keys(model, keys);
            eval("G."+modelName+".destroy("+params+", logout)");
          }

          function logout(){
            destroyUserAndLogout(user.id, login);
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
   * @param login     {Boolean}        if we should login a valid user or not
   */
  T.testUpdate = function(modelName, createFn, login){
    asyncTest("Update existing user", function(){
      createUserAndLogin(login, function (user){
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

          params = params.slice(0, params.length-1)
          params += "}";

          eval("G."+modelName+".update("+params+", assertAndDestroy)");

          function assertAndDestroy(model, xhr){
            T.assert_success(xhr);

            for(var key in model){
              var value = model[key];
              if(isNaN(value)){
                equal(value, testString, value+" should be "+ testString)
              }else{
                equal(value, testNum, value+" should be "+ testNum)
              }
            }

            var params ="{id:"+original_model.id+"}"
            eval("G."+modelName+".destroy("+params+", logout)");

            function logout(){
              destroyUserAndLogout(user.id, login);
              start();
            }
          }
        });
      });
    });
  }
  

  function assert_keys(model, keys){
    //Expected nonnull keys for new users
    for(var i=0, len=keys.length; i < len; ++i){
      var key = keys[i];
      ok(key in model, key + " is a key in user hash");
    }
  }


  function createUserAndLogin(login, callback){
    G.user.create({
      name:"Tim Test",
      login:"test",
      password:"password",
      password_confirmation: "password",
      app_key : "060f13390ecab0dd28dc6faf684632fe"
    }, function(user, xhr){
      T.assert_success(xhr);

      if(login){
        G.user.login({
          password:"password",
          login:"test"
        }, function(){
          callback(user, xhr);
        });
      }
      else{
        callback(user, xhr);
      }

    });
  }

  function destroyUserAndLogout(userId, loggedIn, callback){
    G.user.destroy({
      id:userId
    },
    function() {
      if(loggedIn){
        G.user.logout();
      }
    });
  }

})();