(function() {

  /**
   * Creates a context for a given test function to be run in. Specifically
   * with regards to the login authentication realms of the user and app with
   * flexibility for more releams as loginTypes.
   *
   * @param operation {String}      a descriptor for the test to be run
   * @param loginType {String}      a type of login options are [app, user]
   * @param testFn {Function}       the test to run under the context provided
   * @param userData {Object|Array} data that user desired in the callback
   */

  T.coreTest = function(operation, loginType, testFn, userData) {
    var authLevel = "Public",
      appLogin = loginType == "app",
      userLogin = loginType == "user",
      tempObject = {};

    if (appLogin && userLogin) authLevel = "App and User"
    else if (appLogin) authLevel = "App"
    else if (userLogin) authLevel = "User"
    asyncTest(authLevel + " " + operation, function() {

      var chain = newTestingChain();

      if (appLogin) chain.push(T.appLogin);
      if (userLogin) chain.push(T.loginTestUser);

      testFn(chain, tempObject, userData);

      if (appLogin) chain.push(T.appLogout);
      if (userLogin) chain.push(T.logoutTestUser);

      chain.push(startTest);
      chain.fire();

      function startTest(callback) {
        start();
        callback();
      }
    });

    //Adds the forcePush to enable higher level permissions on that command
    //in this case we log the app in giving the highest level perms to that call
    function newTestingChain() {

      var chain = G.newFnChain();

      chain.appPush = function() {
        var wrappedFn = privilegeElevationWrapper(arguments,
          T.isAppLoggedIn, T.appLogin, T.appLogout);
        return chain.push(wrappedFn);
      };
      chain.userPush = function() {
        var wrappedFn = privilegeElevationWrapper(arguments,
          G.user.isLoggedIn, T.loginTestUser, T.logoutTestUser);
        return chain.push(wrappedFn);
      };


      //This is no joke, read it slowly and think carefully. Its a nested scope
      //chain executed when the primary chain is fired with wrapping for privilege
      //elevation with a local chain... gl!
      function privilegeElevationWrapper(args, isLoggedInFn, loginFn, logoutFn) {
        return function(callback) {
          var localChain = G.newFnChain();
          if (isLoggedInFn()) {
            localChain.push.apply(this, args);
          }
          else {
            localChain.push(loginFn);
            localChain.push.apply(this, args);
            localChain.push(logoutFn);
          }
          localChain.push(delayer);
          localChain.fire();

          //Need to tie the primary chain callback into the end of the local
          //chain. Essentially we are delaying here until the local chain is done
          function delayer(cb) {
            callback();
            cb();
          }

        }
      }

      return chain;
    }

  };

  /**
   * Generic solution for setting the update params on models.
   *
   * @param readOnlyKeys {Array} Keys that can only be read from, no setting
   * @param readableKeys {Array} Keys that should exist for reading in the model
   * @param params {Object}      Reference to a object that will be filled with update params
   * @param testValues {Object}  Set of testValues to set certain types to
   *    Keys are testDate, testString, and testNum
   * @param model {Object}       The returning json model from the create call
   * @param xhr {Object}         The returning XHR object from the request
   */

  T.setUpdateParams = function(readOnlyKeys, readableKeys, params, testValues, model, xhr) {
    T.assertSuccess(xhr);
    T.assertKeys(model, readableKeys);

    //Changes the model around
    for (var key in model) {
      var value = model[key];
      var type = typeof value;
      if (key == "id") { //The only readonly key we want to set in params for update requests
        params[key] = value;
      }
      else if (readOnlyKeys.indexOf(key) != -1) {
        continue; //Don't set any of the other readonly keys
      }
      else if (type === 'number') {
        params[key] = testValues.testNum;
      }
      else if (type === 'boolean') {
        params[key] = !value;
      }
      else if (G.Date.isIso8601Date(value)) {
        params[key] = testValues.testDate;
      }
      else {
        params[key] = testValues.testString;
      }
    }
  };

  /**
   * Generic solution for checking the update on models.
   *
   * @param readOnlyKeys {Array} Keys that can only be read from, no setting
   * @param readableKeys {Array} Keys that should exist for reading in the model
   * @param originalModel {Object} The original json model before updates
   * @param testValues {Object}  Set of testValues to set certain types to
   *    Keys are testDate, testString, and testNum
   * @param model {Object}       The returning json model from the create call
   * @param xhr {Object}         The returning XHR object from the request
   */
  T.checkUpdate = function(readOnlyKeys, readableKeys, originalModel, testValues, model, xhr) {
    T.assertSuccess(xhr);

    for (var i in readableKeys) {
      var key = readableKeys[i];
      var value = model[key];
      var type = typeof value;

      if (readOnlyKeys.indexOf(key) != -1) {
        continue; //These keys may be changed by the system (updated_at for example)
      } else if (type === 'number') {
        equal(value, testValues.testNum, key + " should be " + testValues.testNum);
      }
      else if (type === 'boolean') {
        notEqual(value, originalModel[key], key + " should be opposite of original");
      }
      else if (G.Date.isIso8601Date(value)) {
        var expected = G.Date.iso8601DateString(testValues.testDate);
        equal(value, expected, key + " should be " + expected);
      }
      else {
        equal(value, testValues.testString, key + " should be " + testValues.testString);
      }
    }
  };


  T.baseReadSuccessful = function(keys, model, xhr) {
    checkParams([keys, model, xhr], "baseReadSuccessful");
    T.assertSuccess(xhr);
    T.assertKeys(model, keys);
  };

  T.baseSuccessAndParams = function(params, model, xhr) {
    checkParams([params, model, xhr], "baseSuccessAndParams");
    T.assertSuccess(xhr);
    params.id = model.id;
  };

  T.baseParamsAndAssert = function(keys, params, model, xhr) {
    checkParams([keys, params, model, xhr], "baseParamsAndAssert");
    T.assertSuccess(xhr);
    T.assertKeys(model, keys)
    params.id = model.id;
  };

  //Great for index checks
  T.baseCheckAllModels = function(modelName, keys, models, xhr) {
    checkParams([modelName, keys, models, xhr], "baseCheckAllModels");
    T.assertSuccess(xhr, "Index operation succeeded");
    for (var i in models) {
      var model = models[i][modelName];
      T.assertKeys(model, keys)
    }
  };

  function checkParams(validParams, functionName) {
    for (var i in validParams) {
      if (!validParams[i]) {
        throw("Invalid parameters to " + functionName);
      }
    }
  }


  /**
   * Gets a test test user. If multiple calls come in we create a listner list.
   *
   */
  T.getTestUser = function(callback) {
    T.getTestUser.callbacks = T.getTestUser.callbacks || [];

    if (T.getTestUser.user) {
      callback(T.getTestUser.user);
      return;
    }
    else if (!T.getTestUser.called) {
      T.getTestUser.called = true;
      G.user.create({
        name:"Tim Test",
        login:"test",
        password:"password"
      }, function(user, xhr) {
        T.getTestUser.user = user;
        for (var i in T.getTestUser.callbacks) {
          T.getTestUser.callbacks[i](T.getTestUser.user);
        }
      });
    }

    T.getTestUser.callbacks.push(callback);
  };

  T.destroyTestUser = function(callback) {
    T.getTestUser(function(user) {
      G.user.destroy({
        id:user.id
      }, callback);
    });
  };

  T.loginTestUser = function(callback) {
    T.getTestUser(function() {
      G.user.login({
        password:"password",
        login:"test"
      }, callback);
    });
  };

  T.logoutTestUser = function(callback) {
    G.user.logout(callback);
  };

  T.assertKeys = function(model, keys) {
    //Check that all the model keys are in the keys array
    for (var mKey in model) {
      notStrictEqual(keys.indexOf(mKey), -1, mKey + " was not expected as a model key (extra?)");
    }

    //check that all the keys in the keys array are in the model
    for (var i = 0, len = keys.length; i < len; ++i) {
      var key = keys[i];
      ok(key in model, key + " was in the model");
    }
  };

  T.fail = function(json, xhr) {
    T.assertFailure(xhr);
  };

  T.succeed = function(json, xhr) {
    T.assertSuccess(xhr);
  };

})();