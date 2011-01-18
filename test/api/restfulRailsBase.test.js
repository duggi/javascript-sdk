(function(){

  T.testDestroy = function(modelName, createFn){
    asyncTest("Destroy "+modelName, function(){
      createUserAndLogin(function (user){

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
            destroyUserAndLogout(user.id);
            start();
          }
        });
      });
    });
  }

  T.testCreate = function(modelName, keys, createFn){
    asyncTest("Create new "+modelName, function(){
      createUserAndLogin(function (user){
        createFn(function(model){

          assert_keys(model, keys);
          var params ="{id:"+model.id+"}"

          eval("G."+modelName+".destroy("+params+", logout)");

          function logout(){
            destroyUserAndLogout(user.id);
            start();
          }
        });
      });

    });
  }

  T.testShow = function(modelName, keys, createFn){
    asyncTest("Show "+modelName, function(){
      createUserAndLogin(function(user){
        createFn(function(model){
          var params ="{id:"+model.id+"}"

          eval("G."+modelName+".read("+params+",assertAndDestroy)")

          function assertAndDestroy(){
            assert_keys(model, keys);
            eval("G."+modelName+".destroy("+params+", logout)");
          }

          function logout(){
            destroyUserAndLogout(user.id);
            start();
          }
        });
      });
    });
  }

  T.testUpdate = function(modelName, createFn){
    asyncTest("Update existing user", function(){
      createUserAndLogin(function (user){
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
          params = params.slice(0, params.length-2)
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
              destroyUserAndLogout(user.id);
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


  function createUserAndLogin(callback){
    G.user.create({
      name:"Tim Test",
      login:"test",
      password:"password",
      password_confirmation: "password",
      app_key : "060f13390ecab0dd28dc6faf684632fe"
    }, function(user, xhr){
      T.assert_success(xhr);
      G.user.login({
        password:"password",
        login:"test"
      }, function(){
        callback(user, xhr);
      });
    });
  }

  function destroyUserAndLogout(userId, callback){
    G.user.destroy({
      id:userId
    },
    function() {
      G.user.logout();
    })
  }

})();