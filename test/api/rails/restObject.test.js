(function(){

  /**
   * Tests the CRUD suite.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param keys      {Array}          list of keys required to be accessible in
   *                                    the returned object
   * @param createFn  {Function}       function that creates and returns model
   * @param login     {Boolean}        If we should login with the test user or not
   */
  
  T.testCRUD = function(modelName, keys, createFn, login){
    /**
     * The reason we can get away calling these functions in succession without
     * chaining is two fold, first asyncTests block other tests from running
     * and second any one crud suite shouldn't compromise itself with state
     */
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
   * @param login     {Boolean}        If we should login with the test user or not
   */
  T.testDestroy = function(modelName, createFn, login){
    asyncTest("Destroy "+modelName, function(){
      var chain = G.newFnChain(),
      params = {};

      if(login) chain.push(T.loginTestUser);
      chain.push(createFn, getParams)
      .push(eval("G."+modelName+".destroy"), [params])
      .push(eval("G."+modelName+".read"), [params], fail)
      .fire();

      
      function getParams(model){
        params.id = model.id;
      }
      
      function fail(model, xhr){
        T.assertFailure(xhr);
        if(login) T.logoutTestUser();
        start();
      }
    });
  }

  /**
   * Tests the create call to the server.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param keys      {Array}          list of keys required to be accessible in 
   *                                    the returned object
   * @param createFn  {Function}       function that creates and returns model
   * @param login     {Boolean}        If we should login with the test user or not
   */
  T.testCreate = function(modelName, keys, createFn, login){
    asyncTest("Create new "+modelName, function(){
      var chain = G.newFnChain(),
      params = {};

      if(login) chain.push(T.loginTestUser);
      chain.push(createFn, paramsAndAssert)
      .push(eval("G."+modelName+".destroy"), [params], finish)
      .fire();


      function paramsAndAssert(model){
        assertKeys(model, keys);
        params.id = model.id;
      }
      
      function finish(){
        if(login) T.logoutTestUser();
        start();
      }
    });
  }


  /**
   * Tests the show call to the server.
   *
   * @param modelName {String}         the name of the model to use in the api
   * @param keys      {Array}          list of keys required to be accessible in
   *                                    the returned object
   * @param createFn  {Function}       function that creates and returns model
   * @param login     {Boolean}        If we should login with the test user or not
   */
  T.testShow = function(modelName, keys, createFn, login){
    asyncTest("Show "+modelName, function(){
      var chain = G.newFnChain(),
      params = {};

      if(login) chain.push(T.loginTestUser);
      chain.push(createFn, getParams)
      .push(eval("G."+modelName+".read"), [params], assert)
      .push(eval("G."+modelName+".destroy"), [params], finish)
      .fire();

      function getParams(model){
        params.id = model.id;
      }

      function assert(model){
        assertKeys(model, keys);
      }

      function finish(){
        if(login) T.logoutTestUser();
        start();
      }
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
   * @param login     {Boolean}        If we should login with the test user or not
   */
  T.testUpdate = function(modelName, createFn, login){
    asyncTest("Update existing "+modelName, function(){

      var chain = G.newFnChain(),
      params = {},
      testString ="someString84759",
      testNum = 87499203,
      testDate = new Date();

      if(login) chain.push(T.loginTestUser);
      chain.push(createFn, setParams)
      .push(eval("G."+modelName+".update"), [params], assertSuccess)
      .push(eval("G."+modelName+".read"), [params], assertKeys)
      .push(eval("G."+modelName+".destroy"), [params], finish)
      .fire();


      var original_model
      function setParams(model){
        original_model = model;
        //Changes the model around
        for(var key in original_model){
          var value = original_model[key];
          var type = typeof value;
          if(key == "id" || key == "persistence_token"){
            params[key] = value;
          }
          else if(type === 'number'){
            params[key] = testNum;
          }
          else if(type === 'boolean'){
            params[key] = !value;
          }
          else if(G.date.isIso8601Date(value)){
            params[key] = testDate;
          }
          else{
            params[key] = testString;
          }
        }
      }

      function assertSuccess(json, xhr){
        T.assertSuccess(xhr);
      }

      function assertKeys(model, xhr){
        for(var key in model){
          var value = model[key];
          var type = typeof value;
        
          if(key == "id" || key == "persistence_token"){
            equal(model[key], original_model[key], key +" should be unchanged");
          }
          else if(type === 'number'){
            equal(value, testNum, key+" should be "+ testNum);
          }
          else if(type === 'boolean'){
            notEqual(value, original_model[key], key+" should be opposite of original");
          }
          else if(G.date.isIso8601Date(value)){
            var expected = G.date.iso8601DateString(testDate);
            equal(value, expected, key+" should be "+ expected);
          }
          else{
            equal(value, testString, key+" should be "+ testString);
          }
        }
      }

      function finish(){
        if(login) T.logoutTestUser();
        start();
      }

    });
  };
 

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
        password:"password"
      }, function(user, xhr){
        T.getTestUser.user = user;
        for(var i in T.getTestUser.callbacks){
          T.getTestUser.callbacks[i](T.getTestUser.user);
        }
      });
    }

    T.getTestUser.callbacks.push(callback);
  }

  T.destroyTestUser = function(callback){
    T.getTestUser(function(user){
      G.user.destroy({
        id:user.id
      }, callback);
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

  function assertKeys(model, keys){
    //Expected nonnull keys for new users
    for(var i=0, len=keys.length; i < len; ++i){
      var key = keys[i];
      ok(key in model, key + " is a key in model hash");
    }
  }

})();