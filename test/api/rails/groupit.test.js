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
(function(){
  module("Groupit");
  //Keys that should be included in every response from the server

  var publicKeys = ["product_image", "product_url", "product", "price", "message",
  "surprise", "quantity","user_id","recipient", "options","active", "lead_url", "support_url"];
  var userKeys = publicKeys;
  var appKeys = userKeys.concat(["purchased", "groupit_type"]);

  var R_PublicKeys = ["id", "created_at", "updated_at", "hash_digest"];
  var R_UserKeys = R_PublicKeys;
  var R_AppKeys = R_UserKeys;

  var readablePublicKeys = publicKeys.concat(R_PublicKeys);
  var readableUserKeys = userKeys.concat(R_UserKeys);
  var readableAppKeys = appKeys.concat(R_AppKeys);

 
  //---HELPERS---------------------------------------------------
  function createGroupit(callback){
    G.groupit.create({
      product: "Ipod",
      price: 234,
      surprise: true,
      quantity: 1
    }, callback);
  }

  //---INDEX TESTS---------------------------------------------
  T.coreTest("Index", "app", indexSucceed, false);
  T.coreTest("Index", "user", indexSucceed, false);
  T.coreTest("Index", "public", indexSucceed, true);

  function indexSucceed(chain, temp, addGroupitHash){
    temp.params = {};
    chain
    .push(createGroupit, successAndParams)
    .push(G.groupit.index, [{}], T.succeed) //I think this should fail under user.
    .appPush(G.groupit.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr)
      if(addGroupitHash){
        temp.params.hash_digest = model.hash_digest
      }
    }

  }

  //---CREATE TESTS--------------------------------------------
  var appCreate = {
    keys: readableAppKeys,
    addGroupitHash: false
  };
  var userCreate = {
    keys: readableUserKeys,
    addGroupitHash: false
  };
  //Groupits on create return a higher level (USER) on create rather than public
  //for anon groupits
  var publicCreate = {
    keys: readableUserKeys,
    addGroupitHash: true
  };


  T.coreTest("Create", "app", createSucceed, appCreate);
  T.coreTest("Create", "user", createSucceed, userCreate);
  T.coreTest("Create", "public", createSucceed, publicCreate);

  function createSucceed(chain, temp, data){
    var keys = data.keys,
    addGroupitHash = data.addGroupitHash;
    
    temp.params = {};
    chain
    .push(createGroupit, paramsAndAssert)
    .appPush(G.groupit.destroy, [temp.params], T.succeed);

    function paramsAndAssert(model, xhr){
      T.baseParamsAndAssert(keys,temp.params, model, xhr);
      if(addGroupitHash){
        temp.params.hash_digest = model.hash_digest;
      }
    }
  }



  //---READ TESTS-----------------------------------------------

  var appRead = {
    keys: readableAppKeys,
    addGroupitHash: false
  };
  var userRead = {
    keys: readableUserKeys,
    addGroupitHash: false
  };
  var publicRead = {
    keys: readablePublicKeys,
    addGroupitHash: true
  };


  T.coreTest("Read", "app", readSucceed, appRead);
  T.coreTest("Read", "user", readSucceed, userRead);
  T.coreTest("Read", "public", readSucceed, publicRead);

  function readSucceed(chain, temp, data){
    temp.params = {}
    var keys = data.keys,
    addGroupitHash = data.addGroupitHash;

    chain
    .push(createGroupit, successAndParams)
    .push(G.groupit.read, [temp.params], readSuccessful)
    .appPush(G.groupit.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
      if(addGroupitHash){
        temp.params.hash_digest = model.hash_digest
      }
    }

    function readSuccessful(model, xhr){
      T.baseReadSuccessful(keys, model, xhr);
    }
  }


  //---UPDATE TESTS---------------------------------------------

  var appUpdate = {
    readOnlyKeys: R_AppKeys,
    readableKeys: readableAppKeys,
    succeed:true,
    addGroupitHash:false
  };
  var userUpdate = {
    //Changing the user_id is allowed but it changes ownership, preventing
    //the user from reading it again. So we don't test the setting user_id here
    readOnlyKeys: R_UserKeys.concat(["user_id"]),
    readableKeys: readableUserKeys,
    succeed:true,
    addGroupitHash:false
  };
  var publicUpdate = {
    readOnlyKeys: R_UserKeys.concat(["user_id"]),
    readableKeys: readableUserKeys,
    succeed:true,
    addGroupitHash:true
  };
  var publicFailUpdate = {
    readOnlyKeys: R_UserKeys.concat(["user_id"]),
    readableKeys: readableUserKeys,
    succeed:false,
    addGroupitHash:false
  };


  T.coreTest("Update", "app", update, appUpdate);
  T.coreTest("Update", "user", update, userUpdate);

  /**
   * Simulating the public anon support with the hash_digest acting as the temp key
   */
  T.coreTest("Update Succeed", "public", update, publicUpdate);


  /**
   * Normal public access
   */
  T.coreTest("Update Fail", "public", update, publicFailUpdate);


  function update(chain, temp, data){
    var readOnlyKeys = data.readOnlyKeys,
    readableKeys = data.readableKeys,
    addGroupitHash = data.addGroupitHash,
    succeed = data.succeed;

    temp.params = {};
    temp.updateParams = {};

    chain
    .userPush(createGroupit, setUpdateParams)
    .push(G.groupit.update, [temp.updateParams],succeed ? T.succeed : T.fail)
    .push(G.groupit.read, [temp.params], checkUpdate)
    .appPush(G.groupit.destroy, [temp.params], T.succeed )


    function setUpdateParams(model, xhr){
      temp.originalModel = model;
      T.setUpdateParams(readOnlyKeys, readableKeys, temp.updateParams, T.defaultTestValues, model, xhr);
      T.baseSuccessAndParams(temp.params, model, xhr);
      if(addGroupitHash){
        temp.params.hash_digest = model.hash_digest;
        temp.updateParams.hash_digest = model.hash_digest;
      }
    }

    function checkUpdate(model, xhr){
      if(succeed){
        T.checkUpdate(readOnlyKeys, readableKeys, temp.originalModel, T.defaultTestValues, model, xhr);
      }
      else{
        //TODO might want to check that the result didn't change but not now
        T.assertSuccess(xhr, "Read after update should succeed");
      }
    }
  }


  //---DESTROY TESTS---------------------------------------------------

  var appDestroy = {
    succeed:true,
    addGroupitHash: false
  };
  var userDestroy = {
    succeed:true,
    addGroupitHash: false
  };
  var publicDestroy = {
    succeed:true,
    addGroupitHash: true
  };
  var publicDestroyFail = {
    succeed:false,
    addGroupitHash: false
  };

  T.coreTest("Destroy", "app", destroy, appDestroy);
  T.coreTest("Destroy", "user", destroy, userDestroy);
  T.coreTest("Destroy", "public", destroy, publicDestroy);
  T.coreTest("Destroy", "public", destroy, publicDestroyFail);

  function destroy(chain, temp, data){
    var succeed = data.succeed,
    addGroupitHash = data.addGroupitHash;
    
    temp.params = {};
    chain
    .push(createGroupit, successAndParams)
    .push(G.groupit.destroy, [temp.params], succeed ? T.succeed: T.fail)
    .push(G.groupit.read, [temp.params], succeed ? T.fail: T.succeed)
    if(!succeed){
      chain.appPush(G.groupit.destroy, [temp.params], T.succeed);
    }

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
      if(addGroupitHash){
        temp.params.hash_digest = model.hash_digest;
      }
    }
  }

})();