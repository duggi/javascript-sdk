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

  newEmail: function(json) {
    var namespace = G.models.email;
    return G.DataObject.commonConstructor(namespace, G.newEmail, json);
  }

});


G.provide("models.email", {

  objectName: "email",
  path: "/emails",
  keys: ["address", "primary", "user_id", "retail_contact", "id",
    "created_at", "updated_at", "hash_digest"],

  /**
   * Base constructor function for the contribution model
   */
  Base:function() {
    var self = this;

    self.resendVerify = function(config) {
      config = config || {};
      var params = self.data(),
        path = G.models.email.path + "/" +
          (params.id || "undefined") + "/resend_verify";

      params = G.dogfort.injectRailsParams(params);

      G.api(path, "get", params, function(json, xhr) {
        if (xhr.success) {
          if (config.success) config.success(self, xhr);
        } else {
          if (config.error) config.error(json, xhr);
        }
        if (config.complete) config.complete(json, xhr);
      });
    }

  }


});