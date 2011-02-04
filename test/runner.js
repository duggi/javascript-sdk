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

/**
 * Primary entry point for running all the tests.
 */

(function() {

  //Nice hacky way to get global tooling
  window.T = {
    assertSuccess: function (xhr, message) {
      if (!message) {
        message = "Response was successful"
      }

      ok(xhr.status.toString().match(/^2../), message);
    },

    assertFailure: function (xhr, message) {
      if (!message) {
        message = "Response was a failure"
      }
      ok(xhr.status.toString().match(/^[4,5]../), message);
    },

    appLogin:function(callback) {
      G.RestObject.appSecret = T.appSecret;
      if (callback) {
        callback();
      }
    },

    appLogout:function(callback) {
      G.RestObject.appSecret = null;
      if (callback) {
        callback();
      }
    },

    isAppLoggedIn:function() {
      return !!G.RestObject.appSecret;
    },

    debug:function(data, callback) {
      G.log(data);
      if (callback)
        callback();
    },

    defaultTestValues: {
      testString: "someString84759",
      testNum:87499203,
      testDate:new Date()
    },

    appSecret: "232b2153ca8d7f916f593cd31a42a00bae714f18141791ba680851089b36c5b325f9eeda18e5f16ebe4eff996e0e17588a0279f402f6b11d9d08f4856431aa58"

  };

  function loadTest(src) {
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src + "?" + (new Date().getTime()); //Cache buster
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  }

  test("Placeholder", function() {
    stop();
    G.initialize("eebd71d2cc7968fa770321f7020aa4de", "http://localhost:3000/", loadTests);
  });


  function loadTests() {
    start();
    //Long list of all the tests files we load for testing
//  loadTest("api/api.test.js");
//  loadTest("api/chaining.test.js");
//  loadTest("common/common.test.js");
//  loadTest("provide.test.js");


    //restObject must be loaded before all other rails objects
    loadTest("api/rails/restObject.test.js");
//    loadTest("api/rails/user.test.js"); //Need to fix update (removing T.params)
    loadTest("api/rails/groupit.test.js");
//    loadTest("api/rails/contribution.test.js"); //Need to think out the rest of the API with contribution
//    loadTest("api/rails/participant.test.js");
//    loadTest("api/rails/paymentResponse.test.js");
//    loadTest("api/rails/note.test.js");
//    loadTest("api/rails/feedPost.test.js");
//    loadTest("api/rails/email.test.js");
//    loadTest("api/rails/authentication.test.js");
//    loadTest("api/rails/app.test.js");
//    loadTest("api/rails/address.test.js");
//    loadTest("api/rails/userSession.test.js");

//TODO Need To called DestroyTestUser down here somewhere after
//all the tests have been run
//MAKE sure to reenable the unique constraint in the users table


  }


})();







