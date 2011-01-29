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
  module("Participant")
  //Keys that should be included in every response from the server

  var publicKeys = [];
  var userKeys = publicKeys.concat(["groupit_id", "contacted", "is_public", "user_id"]);
  var appKeys = userKeys

  var R_PublicKeys = [];
  var R_UserKeys = R_PublicKeys.concat(["id", "created_at", "updated_at"]);
  var R_AppKeys = R_UserKeys;

  var readablePublicKeys = publicKeys.concat(R_PublicKeys);
  var readableUserKeys = userKeys.concat(R_UserKeys);
  var readableAppKeys = appKeys.concat(R_AppKeys);


  //---HELPERS---------------------------------------------------
  function createParticipant(callback){
    G.participant.create({
      user_id: 123,
      groupit_id: 123,
      contacted: false,
      is_public: false
    },callback);
  }

  //---INDEX TESTS---------------------------------------------
  var appIndex = {
    keys: readableAppKeys,
    succeed : true
  }
  var userIndex = {
    keys: readableUserKeys,
    succeed : true
  }
  var publicIndex = {
    keys: readablePublicKeys,
    succeed : false
  }

  T.coreTest("Index", "app", index, appIndex);
  T.coreTest("Index", "user", index, userIndex);
  T.coreTest("Index", "public", index, publicIndex);


  function index(chain, temp, data){
    var keys = data.keys,
    succeed = data.succeed;

    temp.params = {};

    chain
    .push(createParticipant, successAndParams)
    .push(G.participant.index, [{}], indexCheck)
    .appPush(G.participant.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
    }

    //Branch structure for the indexCheck
    function indexCheck(models, xhr){
      if(succeed)
        T.baseCheckAllModels("participant", keys, models, xhr);
      else
        T.assertFailure(xhr, "Index operation should fail");
    }
  }


  //---CREATE TESTS--------------------------------------------

  T.coreTest("Create", "app", createSucceed, readableAppKeys);
  T.coreTest("Create", "user", createSucceed, readableUserKeys);
  //On public create we boost the read access to USER instead of PUBLIC
  T.coreTest("Create", "public", createSucceed, readableUserKeys);

  function createSucceed(chain, temp, keys){
    temp.params = {};
    chain
    .push(createParticipant, function(model, xhr){
      T.baseParamsAndAssert(keys, temp.params, model, xhr);
    })
    .appPush(G.participant.destroy, [temp.params], T.succeed)
  }


  //---READ TESTS-----------------------------------------------
  var appRead = {
    keys: readableAppKeys,
    succeed : true
  }
  var userRead = {
    keys: readableUserKeys,
    succeed : true
  }
  var publicRead = {
    keys: readablePublicKeys,
    succeed : false
  }

  T.coreTest("Read", "app", read, appRead);
  T.coreTest("Read", "user", read, userRead);
  T.coreTest("Read", "public",read, publicRead);

  function read(chain, temp, data){
    var succeed = data.succeed,
    keys = data.keys;
    temp.params = {};

    chain
    .push(createParticipant, successAndParams)
    .push(G.participant.read, [temp.params], readCheck)
    .appPush(G.participant.destroy, [temp.params], T.succeed)


    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
    }

    function readCheck(model, xhr){
      if(succeed)
        T.baseReadSuccessful(keys, model, xhr)
      else
        T.assertFailure(xhr, "Read should have failed");
    }

  }


  //---UPDATE TESTS---------------------------------------------

  var appUpdate = {
    readOnlyKeys: R_AppKeys,
    readableKeys: readableAppKeys,
    succeed:true
  }
  var userUpdate = {
    //Changing the user_id is allowed but it changes ownership, preventing
    //the user from reading it again. So we don't test the setting user_id here
    readOnlyKeys: R_UserKeys.concat(["user_id"]),
    readableKeys: readableUserKeys,
    succeed:true
  }
  var publicUpdate = {
    readOnlyKeys: R_AppKeys,
    readableKeys: readableAppKeys,
    succeed:false
  }

  T.coreTest("Update", "app", update, appUpdate);
  T.coreTest("Update", "user", update, userUpdate);
  T.coreTest("Update", "public", update, publicUpdate);


  function update(chain, temp, data){
    var readOnlyKeys = data.readOnlyKeys,
    readableKeys = data.readableKeys;
      
    temp.params = {};
    temp.updateParams = {};
    temp.originalModel = null;

    chain
    .push(createParticipant, setUpdateParams)
    .push(G.participant.update, [temp.updateParams], data.succeed? T.succeed : T.fail)
    .push(G.participant.read, [temp.params], checkUpdate)
    .appPush(G.participant.destroy, [temp.params], T.succeed)


    function setUpdateParams(model, xhr){
      temp.originalModel = model;
      T.setUpdateParams(readOnlyKeys, readableKeys, temp.updateParams, T.defaultTestValues, model, xhr);
      T.baseSuccessAndParams(temp.params, model, xhr);
    }

    function checkUpdate(model, xhr){
      if(data.succeed){
        T.checkUpdate(readOnlyKeys, readableKeys, temp.originalModel, T.defaultTestValues, model, xhr);
      }
      else{
        //TODO might want to check that the result didn't change but not now
        T.assertFailure(xhr, "Update should fail");
      }
    }
  }

  //---DESTROY TESTS---------------------------------------------------

  T.coreTest("Destroy", "app", destroy, true);
  T.coreTest("Destroy", "user", destroy, true);
  T.coreTest("Destroy", "public", destroy, false);

  function destroy(chain, temp, succcess){
    temp.params = {};
    
    chain
    .push(createParticipant, successAndParams)
    .push(G.participant.destroy, [temp.params], succcess ? T.succeed : T.fail)
    .appPush(G.participant.read, [temp.params], succcess ? T.fail : T.succeed)

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
    }
  }
  

})();