/**
 * Primary entry point for running all the tests.
 */

(function(){

  //Nice hacky way to get global tooling
  window.T ={
    assert_success: function (xhr){
      ok(xhr.status.toString().match(/^2../), "Response was successful");
    },
    
    createUser:function(callback){
      G.user.create({
        name:"Tim Test",
        login:"test",
        password:"password",
        password_confirmation: "password",
        app_key : "060f13390ecab0dd28dc6faf684632fe"
      }, function(user, xhr){
        T.assert_success(xhr);
        callback(user, xhr);
      });
    }
  }


  function loadTest(src){
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  }


  //Long list of all the tests files we load for testing
  loadTest("api/api.test.js");
  loadTest("common/common.test.js");
  loadTest("provide.test.js");
  loadTest("api/user.test.js");
  loadTest("api/userSession.test.js");

})();







