/**
 * Copyright (c) 2011 Timothy Cardenas
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 */

G.provide("", {
  newGroupit: function() {
    var namespace = G.models.groupit;
    return G.DataObject.commonConstructor(namespace, G.newContribution, json);
  }
});

//TODO migrate over to just groupit once we go to restObject
G.provide("models.groupit", {

  //TODO need to do inventory on the keys returned from the server
  objectName: "groupit",
  path: "/groupits",
  keys: ["id", "product_image", "product_url", "product", "price",
    "message", "surprise", "quantity","user_id","recipient", "options",
    "active", "lead_url", "support_url", "purchased", "groupit_type",
    "created_at", "updated_at", "hash_digest", "organizer", "amount_raised"],


  index: function(config) {
    //Testing out the includes directive
    var params = {
      include: {
        user: {
          include: "emails"
        }
      }
    };

    G.DataObject.commonIndex(config, G.models.groupit, G.newGroupit, params);
  },

  Base: function() {


  }

});