(function(){
  module("Provider");

  test("Provider functions", function(){
    ok(G, "Assert that G exists");
    testNoConflict();
    testCreate();
    testCopy();
    testProvide();
  });

  function testNoConflict(){
    var oldG = G;
    var barG = _G = "NotG"
    G.noConflict("someOtherName");
    ok(someOtherName, "noConflict: renamed object exists");
    equal(someOtherName, oldG, "noConflict: didn't change the renamed object");
    notEqual(G, oldG, "noConflict: noConflict reliquished old object");
    someOtherName.noConflict("G");
    equal(_G, barG, "noConflict: _G must be preserved after switching back to G");
    equal(G, oldG, "noConflict: test must leave G back where it began");
  }

  function testCreate(){
    ok(!G.testNamespacedObject, "create: start with undefined object");
    var newObject = G.create("testNamespacedObject");
    ok(newObject, "create: new object created");
    ok(G.testNamespacedObject, "create: new object bound to G");
    G.testNamespacedObject.pickels = true;
    G.create("testNamespacedObject");
    ok(G.testNamespacedObject.pickels, "create: didn't overwrite previously defined object");
  }

  function testCopy(){
    var target = {
      test: true,
      batman:"robin"
    };
    var source = {
      test: false,
      yay: "wee"
    }
    G.copy(target, source, false);
    ok(target.test, "copy: overwrite=false doesn't overwrite");
    G.copy(target, source, true);
    ok(!target.test, "copy: overwrite=true does overwrite");
    equal(target.test, false, "copy: part one of aggregate copy");
    equal(target.batman, "robin", "copy: part two of aggregate copy");
    equal(target.yay, "wee", "copy: part three of aggregate copy");
  }

  function testProvide(){
    G.provide("someNamedspacedObject", {
      test: true
    }, false);
    ok(G.someNamedspacedObject, "provide: should create a namespaced object in G");
    ok(G.someNamedspacedObject.test, "provide: should copy implementation into object");
  }

})();