Groupit Javascript SDK
===============================

Groupit is a group purchasing solution that easily plugs into any site.
Checkout groupit.com/partners for more information


Documentation
-------------
To come....


Building
--------
The groupit SDK is organized into directories that encapsulate some
functionality. We release a standard prebuilt js file that includes the full
functionality of the SDK however anyone may run our compile script and generate
a custom js file that includes just the functionality that they need.

To run the compiler you must have ruby and the thor gem installed.
(Thor is to replace rake and is baked into rails by default)

thor ./compile.thor [options]  ====> outputs groupit.js

thor compiler:debug
thor compiler:compile


Tests
-----
To run tests simply point a browser to the runner.html file in the test
directory.

We use Qunit (jquery's unit test suite) to test our sdk. Its all self contained.
The suite expects qunit source, and groupit.min.js in the root directory.


Reporting Issues
--------
opensource@groupit.com
