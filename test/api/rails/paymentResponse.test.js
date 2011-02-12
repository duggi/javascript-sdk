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
(function() {
  module("PaymentReponse");
  //Keys that should be included in every response from the server 
  var publicKeys = [];
  var userKeys = publicKeys;
  var appKeys = userKeys.concat(["user_id", "groupit_id", "ip_address", "success", "response", "is_public"]);

  var R_PublicKeys = [];
  var R_UserKeys = R_PublicKeys;
  var R_AppKeys = R_UserKeys.concat(["id","created_at", "updated_at"]);

  var readablePublicKeys = publicKeys.concat(R_PublicKeys);
  var readableUserKeys = userKeys.concat(R_UserKeys);
  var readableAppKeys = appKeys.concat(R_AppKeys);


  //---HELPERS---------------------------------------------------
  function createPaymentResponse(callback) {
    G.paymentResponse.create({
      groupit_id: 123,
      user_id: 123,
      ip_address: "192.168.1.1",
      success: true,
      response: "BIG OL response"
    }, callback);
  }


  //---INDEX TESTS---------------------------------------------
  T.coreTest("Index", "app", indexSucceed, readableAppKeys);
  T.coreTest("Index", "user", indexFail);
  T.coreTest("Index", "public", indexFail);

  function indexSucceed(chain, temp, keys) {
    temp.params = {};
    chain
      .push(createPaymentResponse, successAndParams)
      .push(G.paymentResponse.index, [
      {}
    ], checkAllModels)
      .appPush(G.paymentResponse.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr) {
      T.baseSuccessAndParams(temp.params, model, xhr)
    }

    function checkAllModels(models, xhr) {
      T.baseCheckAllModels("payment_response", keys, models, xhr)
    }
  }

  function indexFail(chain) {
    chain
      .push(G.paymentResponse.index, [
      {}
    ], T.fail)
  }

  //---CREATE TESTS--------------------------------------------

  T.coreTest("Create", "app", createSucceed, readableAppKeys);
  T.coreTest("Create", "user", createFail);
  T.coreTest("Create", "public", createFail);

  function createSucceed(chain, temp, keys) {
    temp.params = {};

    chain
      .push(createPaymentResponse, paramsAndAssert)
      .appPush(G.paymentResponse.destroy, [temp.params], T.succeed)

    function paramsAndAssert(model, xhr) {
      T.baseParamsAndAssert(keys, temp.params, model, xhr)
    }
  }

  function createFail(chain) {
    chain
      .push(createPaymentResponse, T.fail)
  }


  //---READ TESTS-----------------------------------------------

  T.coreTest("Read", "app", readSucceed);
  T.coreTest("Read", "user", readFail);
  T.coreTest("Read", "public", readFail);

  function readSucceed(chain, temp, data) {
    temp.params = {};
    chain
      .push(createPaymentResponse, successAndParams)
      .push(G.paymentResponse.read, [temp.params], readSuccessful)
      .appPush(G.paymentResponse.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr) {
      T.baseSuccessAndParams(temp.params, model, xhr);
    }

    function readSuccessful(model, xhr) {
      T.baseReadSuccessful(readableAppKeys, model, xhr);
    }
  }

  function readFail(chain, temp, data) {
    chain
      .push(createPaymentResponse, T.fail)
      .push(G.paymentResponse.read, [
      {}
    ], T.fail)
      .push(G.paymentResponse.destroy, [
      {}
    ], T.fail)
  }

  //---UPDATE TESTS---------------------------------------------

  var appUpdate = {
    readOnlyKeys: R_AppKeys,
    readableKeys: readableAppKeys,
    succeed:true
  }
  var userUpdate = {
    readOnlyKeys: R_UserKeys,
    readableKeys: readableUserKeys,
    succeed:false
  }
  var publicUpdate = {
    readOnlyKeys: R_PublicKeys,
    readableKeys: readablePublicKeys,
    succeed:false
  }

  T.coreTest("Update", "app", update, appUpdate);
  T.coreTest("Update", "user", update, userUpdate);
  T.coreTest("Update", "public", update, publicUpdate);


  function update(chain, temp, data) {
    var readOnlyKeys = data.readOnlyKeys,
      readableKeys = data.readableKeys,
      succeed = data.succeed;

    temp.params = {};
    temp.updateParams = {};
    temp.originalModel = null;

    chain
      .push(createPaymentResponse, succeed ? setUpdateParams : T.fail)
      .push(G.paymentResponse.update, [temp.updateParams], succeed ? T.succeed : T.fail)
      .push(G.paymentResponse.read, [temp.params], checkUpdate)
    if (succeed) {
      chain.appPush(G.paymentResponse.destroy, [temp.params], T.succeed)
    }


    function setUpdateParams(model, xhr) {
      temp.originalModel = model;
      T.setUpdateParams(readOnlyKeys, readableKeys, temp.updateParams, T.defaultTestValues, model, xhr);
      T.baseSuccessAndParams(temp.params, model, xhr)
    }

    function checkUpdate(model, xhr) {
      if (succeed) {
        T.checkUpdate(readOnlyKeys, readableKeys, temp.originalModel, T.defaultTestValues, model, xhr);
      }
      else {
        //TODO might want to check that the result didn't change but not now
        T.assertFailure(xhr, "Update should fail");
      }
    }
  }

  //---DESTROY TESTS---------------------------------------------------

  T.coreTest("Destroy", "app", destroySucceed);
  T.coreTest("Destroy", "user", destroyFail);
  T.coreTest("Destroy", "public", destroyFail);

  function destroySucceed(chain, temp) {
    temp.params = {};

    chain
      .push(createPaymentResponse, successAndParams)
      .push(G.paymentResponse.destroy, [temp.params], T.succeed)
      .push(G.paymentResponse.read, [temp.params], T.fail)

    function successAndParams(model, xhr) {
      T.baseSuccessAndParams(temp.params, model, xhr);
    }
  }

  function destroyFail(chain, temp) {
    temp.params = {};
    chain
      .appPush(createPaymentResponse, successAndParams)
      .push(G.paymentResponse.destroy, [temp.params], T.fail)
      .appPush(G.paymentResponse.destroy, [temp.params], T.succeed)

    function successAndParams(model, xhr) {
      T.baseSuccessAndParams(temp.params, model, xhr);
    }
  }

})();