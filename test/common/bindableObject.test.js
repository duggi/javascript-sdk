(function() {
  module("Bindable Object", {
    setup: function() {
      this.testNum = 12345;
      this.bindable = G.newBindableObject();
      this.nestedObj = {id:this.testNum};
      this.parentObj = {o:this.nestedObj};
      this.obj = {id:9876};
    }
  });


  test("Basic set and get", function() {

    var testText = "somethingCool";
    var testText2 = "NotSoHot";
    this.bindable.extend({
      prop:testText
    });

    deepEqual(this.bindable.prop(), testText, "Getter should truthfully return value");
    this.bindable.prop(testText2);
    deepEqual(this.bindable.prop(), testText2, "Setter should truthfully return value");

  });

  test("Deep copy extend support", function() {

    var testString = "NAN";
    //Extend with deep copy support
    this.bindable.extend({
      obj:this.parentObj
    }, true);

    this.bindable.obj().o.id = testString;
    deepEqual(this.nestedObj.id, this.testNum, "Original should not change with deep copy");
    notEqual(this.bindable.obj().o.id, this.testNum, "Changed should not equal original");
    equal(this.bindable.obj().o.id, testString, "Changed should equal new value")

  });

  test("Deep copy setter support", function() {

    var testString = "NAN";
    this.bindable.extend({
      obj:null
    });
    this.bindable.obj(this.parentObj, true);

    this.bindable.obj().o.id = testString;
    deepEqual(this.nestedObj.id, this.testNum, "Original should not change with deep copy");
    notEqual(this.bindable.obj().o.id, this.testNum, "Changed should not equal original");
    equal(this.bindable.obj().o.id, testString, "Changed should equal new value")
  });


})();