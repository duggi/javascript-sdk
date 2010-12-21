/**
 * Primary entry point for running all the tests.
 */

(function(){

  function loadTest(src){
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = src;
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
  }

  //Long list of all the tests files we load for testing
  loadTest("api/api.test.js");
  loadTest("common/common.test.js")
  loadTest("provide.test.js")

})();







