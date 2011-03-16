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

We use Qunit (jquery's unit test suite) to test our sdk. It's all self contained.
The suite expects qunit source, and groupit.min.js in the root directory.


Reporting Issues
--------
opensource@groupit.com


Documentation
-------------------------------------------------------------------------------

### Entities
<pre>
------------------------------------------------- MODEL
contribution
email
groupit
user


------------------------------------------------- DATA OBJECT
payment_response
  path: "/payment_responses",
  keys:["user_id", "groupit_id", "ip_address", "success", "response",
    "is_public", "id","created_at", "updated_at"]

participant
  path: "/participants",
  keys: ["groupit_id", "contacted", "is_public", "user_id", "id",
    "created_at", "updated_at", "invited", "organizer", "contributor"]

invitee
  path: "/invitees",
  keys: []

note
  path:"/notes",
  keys: ["note", "metadata_id", "metadata_type", "is_public", "user_id",
    "id", "created_at", "updated_at", "name"]

feed_post
  path:"/feed_posts",
  keys: ["message", "groupit_id", "is_public", "user_id", "id",
    "created_at", "updated_at"]

authentication
  path: "/authentications",
  keys: ["user_id", "provider", "uid", "is_public", "id",
    "created_at", "updated_at"]

app
  path: "/apps",
  keys: ["name", "user_id", "is_public", "id", "created_at", "updated_at", "key"]

address
  path: "/addresses",
  keys: ["fullname", "line1", "line2", "city", "state", "zip", "country",
    "phone_number", "user_id", "is_public", "id", "created_at",
    "updated_at"]


------------------------------------------------- REST OBJECT
paymentResponse
  return new G.RestObject.Base("/payment_responses", "payment_response");

groupit
  return new G.RestObject.Base("/groupits", "groupit");

participant
  return new G.RestObject.Base("/participants", "participant");

note
  return new G.RestObject.Base("/notes", "note");

feedPost
  return new G.RestObject.Base("/feed_posts", "feed_post");

email
  return new G.RestObject.Base("/emails", "email");

authentication
  return new G.RestObject.Base("/authentications", "authentication");

app
  return new G.RestObject.Base("/apps", "app");

address
  return new G.RestObject.Base("/addresses", "address");

// Facades Follow
invitee
  var base = new G.RestObject.Base("/invitees", "invitee");

</pre>
