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
  module("Contribution");
  //Keys that should be included in every response from the server
  var keys =["id", "groupit_id", "address_id", "amount", "user_id",
    "transaction_id", "surcharge", "tax", "payment_response_id", "app_key",
    "is_public"];


  function createContribution(callback){
    G.contribution.create({
      groupit_id: 34,
      address_id: 1263,
      amount: 123.40,
      user_id: 341,
      transaction_id: "234dfs32",
      surcharge: 0,
      tax: 12.43,
      payment_response_id: 123,
      app_key: "060f13390ecab0dd28dc6faf684632fe",
      is_public: true
    }, callback);
  }

  T.testCRUD("contribution", keys, createContribution, true);

  

})();