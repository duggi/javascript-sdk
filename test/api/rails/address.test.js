/**
 * Copyright (c) 2010 Timothy Cardenas
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
(function(){
  module("Address");
  //Keys that should be included in every response from the server
  var keys =["id", "fullname", "line1", "line2", "city", "state",
  "zip", "country", "phone_number", "address_type", "user_id", "app_key",
  "is_public"];

  function createAddress(callback){
    G.address.create({
      fullname: "Timothy Cardenas",
      line1: "23148 S. Austin Road",
      line2: 'Apt 1',
      city: "Manteca",
      state: "Ca",
      zip: 95366,
      country: "USA",
      phone_number: '209-968-1342',
      user_id: 341,
      address_type: "test",
      is_public: true
    }, callback);
  }


  //Need to see how to chain my tests together
  T.testCRUD("address", keys, createAddress, true);

})();