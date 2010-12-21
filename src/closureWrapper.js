/**
 * Note on: function(window, undefined)
 *
 * The undefined is a normal variable and can be changed simply with
 * undefined = "new value";. So we create a local "undefined" variable
 * that is REALLY undefined. (see jquery source for example in the wild)
 *
 * The window variable is made local for performance reasons.
 * Because when javascipt looks up a variable, it first goes through the
 * local variables until it finds the variable name. When it's not found,
 * javascript goes through the next scope etc. until it filters through the
 * global variables. So if the window variable is made local, javascript
 * can look it up quicker.
 *
 * Source (Nicholas C. Zakas and Jquery)
 *
 */

(function(window, undefined){

  //INSERT_JAVASCRIPT_CODE_HERE

  })(window);