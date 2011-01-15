(function(){
  module("User Session");
  var keys =["token"];

  asyncTest("Create new user session", function(){

    T.createUser(function(){
      G.userSession.create({password: "password", login:"test"}, function (userSession){

        //Expected nonnull keys for new users
        for(var i=0, len=keys.length; i < len; ++i){
          var key = keys[i];
          ok(key in userSession, key + " is a key in user hash");
        }

        start();
      });
    })

  });
})();