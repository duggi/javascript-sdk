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
  module("User");
  //Keys that should be included in every response from the server
  var publicKeys = [];
  var userKeys = publicKeys.concat(["name", "login", "organized_before", "is_public"]);
  var appKeys = userKeys

  var R_PublicKeys = ["name"];
  var R_UserKeys = R_PublicKeys.concat(["id", "created_at", "updated_at"]);
  var R_AppKeys = R_UserKeys;

  var readablePublicKeys = publicKeys.concat(R_PublicKeys);
  var readableUserKeys = userKeys.concat(R_UserKeys);
  var readableAppKeys = appKeys.concat(R_AppKeys);
  


  //---HELPERS------------------------------------------------
  function createUser(callback){
    G.user.create({
      name:"Tim Test2",
      login:"test2",
      password:"password"
    }, callback)
  }

  function login(callback){
    G.user.login({
      login:"test2",
      password:"password"
    }, callback);
  }
  

  //---INDEX TESTS---------------------------------------------

  var appLogin = {
    keys:readableAppKeys,
    loginNewUser: false,
    succeed: true
  }
  var userLogin = {
    keys:readableUserKeys,
    loginNewUser: true,
    succeed:false
  }
  var publicIndex = {
    keys:readablePublicKeys,
    loginNewUser: false,
    succeed:false
  }

  T.coreTest("Index", "app", index, appLogin);
  T.coreTest("Index", "user", index, userLogin);
  T.coreTest("Index", "public", index, publicIndex);

  function index(chain, temp, data){
    var keys = data.keys,
    loginNewUser = data.loginNewUser,
    succeed = data.succeed;
    
    temp.params = {};
    chain.push(createUser, successAndParams)
    if(loginNewUser){
      chain.push(login);
    }
    chain
    .push(G.user.index, [{}], succeed ? checkAllModels: T.fail )
    .appPush(G.user.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr)
    }

    function checkAllModels(models, xhr){
      T.baseCheckAllModels('user', keys, models, xhr)
    }
  }

  //---CREATE TESTS--------------------------------------------

  T.coreTest("Create", "app", create, readableAppKeys);
  T.coreTest("Create", "user", create, readableUserKeys);
  //On create priviledge upgraded to USER level
  T.coreTest("Create", "public", create, readableUserKeys);


  function create(chain, temp, keys){
    temp.params = {}
    chain
    .push(createUser, paramsAndAssert)
    .appPush(G.user.destroy, [temp.params], T.succeed)

    function paramsAndAssert(model, xhr){
      T.baseParamsAndAssert(keys, temp.params, model, xhr)
    }
  }


  //---READ TESTS-----------------------------------------------

  T.coreTest("Read", "app", read, readableAppKeys);
  T.coreTest("Read", "user", read, readableUserKeys);
  T.coreTest("Read", "public", read, readablePublicKeys);
  
  function read(chain, temp, keys){
    temp.params = {};
    chain
    .push(createUser, successAndParams)
    .push(G.user.read, [temp.params], readSuccessful)
    .appPush(G.user.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
    }

    function readSuccessful(model, xhr){
      T.baseReadSuccessful(keys, model, xhr);
    }
  }


  //---UPDATE TESTS---------------------------------------------


  var appUpdate = {
    readOnlyKeys: R_AppKeys,
    readableKeys: readableAppKeys,
    succeed: true,
    loginNewUser: false
  }
  var userUpdate = {
    readOnlyKeys: R_UserKeys,
    readableKeys: readableUserKeys,
    succeed: true,
    loginNewUser: true
  }
  var publicUpdate = {
    readOnlyKeys: R_PublicKeys,
    readableKeys: readablePublicKeys,
    succeed: false,
    loginNewUser: false
  }

  T.coreTest("Update", "app", update, appUpdate);
  T.coreTest("Update", "user", update, userUpdate);
  T.coreTest("Update", "public", update, publicUpdate);

  function update(chain, temp, data){
    var readOnlyKeys = data.readOnlyKeys,
    readableKeys = data.readableKeys,
    succeed = data.succeed,
    loginNewUser = data.loginNewUser;
    
    temp.params = {};
    temp.updateParams = {};
    temp.originalModel = null;

    chain.push(createUser, successAndParams)
    if(loginNewUser){
      chain.push(login);
    }
    chain
    .push(G.user.read,[temp.params], setUpdateParams)
    .push(G.user.update, [temp.updateParams], succeed? T.succeed : T.fail)
    .push(G.user.read, [temp.params], succeed ? checkUpdate : T.succeed)
    .appPush(G.user.destroy, [temp.params], T.succeed )

    function successAndParams(model, xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
    }

    function setUpdateParams(model, xhr){
      temp.originalModel = model;
      T.setUpdateParams(readOnlyKeys, readableKeys, temp.updateParams, T.defaultTestValues, model, xhr);
    }

    function checkUpdate(model, xhr){
      T.checkUpdate(readOnlyKeys, readableKeys, temp.originalModel, T.defaultTestValues, model, xhr);
    }
  }

  //---DESTROY TESTS---------------------------------------------------

  var appDestroy = {
    succeed: true,
    loginNewUser: false
  }
  var userDestroy = {
    succeed: true,
    loginNewUser: true
  }
  var publicDestroy = {
    succeed: false,
    loginNewUser: false
  }

  T.coreTest("Destroy", "app", destroy, appDestroy);
  T.coreTest("Destroy", "user", destroy, userDestroy);
  T.coreTest("Destroy", "public", destroy, publicDestroy);

  function destroy(chain, temp, data){
    var succeed = data.succeed,
    loginNewUser = data.loginNewUser;

    temp.params = {};

    chain.push(createUser, successAndParams)
    if(loginNewUser){
      chain.push(login);
    }
    chain.push(G.user.destroy, [temp.params], succeed? T.succeed: T.fail)
    

    function successAndParams(model ,xhr){
      T.baseSuccessAndParams(temp.params, model, xhr);
    }

  }


})();