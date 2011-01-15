(function(){
  module("User");
  var keys =["id", "organized_before", "login", "name", "app_key", "created_at",
  "updated_at", "verified"];

  asyncTest("Create new user", function(){
    var user;
    createUser(function (user){

      //Expected nonnull keys for new users
      for(var i=0, len=keys.length; i < len; ++i){
        var key = keys[i];
        ok(key in user, key + " is a key in user hash");
      }


      G.user.destroy({
        id:user.id,
        user_session: user.persistence_token
      });

      start();
    });
  });

  asyncTest("Edit existing user", function(){
    createUser(function (original_user){
  
      var testString ="someString";
      var testNum = 1234;
      //Changes the user around
      for(var key in original_user){
        if(key == "id") continue; //Don't want to update id'
        if(key == "persistence_token") continue;//Don't want to change the persitence token'
        if(isNaN(original_user[key])){
          original_user[key] = testString
        }else{
          original_user[key] = testNum;
        }
      }
  
      G.user.update(original_user, {user_session: original_user.persistence_token}, function(user, xhr){
        T.assert_success(xhr);
  
        for(var key in user){
          var value = user[key];
          if(isNaN(value)){
            equal(value, testString, value+" should be "+ testString)
          }else{
            equal(value, testNum, value+" should be "+ testNum)
          }
        }
  
        G.user.destroy({
          id:original_user.id,
          user_session: original_user.persistence_token
        });
      
        start();
      });
    })
  });

  function createUser(callback){
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
})();