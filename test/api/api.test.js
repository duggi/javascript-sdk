(function(){

/**
 * Can't run our api tests on a file. Need to server that file...
 */
  test("Raw Api test", function(){
    ok(G.ApiClient, "Assert that api_client exists");
    ok(G.api, "Assert that api sortcut exists");
  });

})();