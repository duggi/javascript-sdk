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
  newGroupit: function(json) {
    var namespace = G.models.groupit;
    return G.DataObject.commonConstructor(namespace, G.newContribution, json);
  }
});

//TODO migrate over to just groupit once we go to restObject
G.provide("models.groupit", {

  //TODO need to do inventory on the keys returned from the server
  objectName: "groupit",
  path: "/groupits",
  keys: ["id", "product_image", "product_uri", "product", "price",
    "message", "surprise", "quantity","user_id","recipient", "options",
    "active", "lead_uri", "support_uri", "purchased", "groupit_type",
    "created_at", "updated_at", "hash_digest", "organizer", "amount_raised"],


  index: function(config) {
    //Testing out the includes directive
    var params = {
      include: ["user","participants","contributions"]
    };

    G.DataObject.commonIndex(config, G.models.groupit, G.newGroupit,
      params, wrapIncludes);

    function wrapIncludes(models) {
      for (var i in models) {
        var j;
        var model = models[i];

        //TODO need to add all these to the keys of a groupit... handle not doing the lookups too..
        //Wrap the user
        if (model.user) {
          model.user(G.newUser(model.user()));
        }

        //Wrap the participants
        if (model.participants) {
          var parts = [];
          for (j in model.participants()) {
            var participant = model.participants()[j];
            //TODO need to get the participant wired with the user
            participant.user = G.newUser(participant.user);
            //TODO FML need those collection attributes
            parts.push(G.newParticipant(participant));
          }
          model.participants(parts);
        }

        //Wrap the contributions
        if (model.contributions) {
          var contrs = [];
          for (j in model.contributions()) {
            var contribution = model.contributions()[j];
            //TODO holy crap clean this
            var user = commonUser(contribution.user_id, model.participants());
            contribution.user = user;
            contrs.push(G.newContribution(model.contributions()[j]));
          }
          model.contributions(contrs);
        }
      }
    }

    //The participants must have a user for the contribution as a contributor => participant
    function commonUser(userId, participants) {
      for (var i in participants) {
        var p = participants[i];
        if (p.userId() == userId) {
          return p.user();
        }
      }
      return null;
    }

  },

  Base: function() {


  }

});