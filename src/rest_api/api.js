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
 * @provides G.api G.ApiClient
 * @requires G.provide G.Array
 *
 */

G.provide('', {

  //Indirection method for the api calls. Can expand out
  //for richer debuging support, etc
  api: function() {
    G.ApiClient.rest.apply(G.ApiClient, arguments);
  },

  //Allows for posting of forms to remote destinations
  postViaForm:function(path, method, params, fullPath) {
    var form = G.ApiClient.createForm(path, method, params, fullPath);
    G.ApiClient.iframeRequest(form);
  },

  postForm: function(form) {
    G.ApiClient.iframeRequest.call(G.ApiClient, form);
  }

});

G.provide('ApiClient', {
  REST_METHODS: ['get', 'post','delete', 'put'],

  /**
   *   rest: REST access to our server with various calling options.
   *
   *   Except for the path all the arguments to this function are
   *   optional. Below are examples of valid invocations.
   *
   *  G.api('gift/delete'); // throw away the response
   *  G.api('gift/delete'), function(r){console.log(r)});
   *  G.api('gift/show'), { param1: 'value1', ... }); //throw away response
   *  G.api('gift', 'put', function(r){ console.log(r) });
   *  G.api(
   *    'gift/create',
   *    'post',
   *    {param1: value1, param2 : value2, ...},
   *    function(r) { console.log(r) }
   *
   * @access private
   * @param path      {String}   the url path
   * @param method    {String}   the http method
   * @param params    {Object}   the parameters for the query
   * @param cb        {Function} the callback function for the response
   */

  rest: function() {
    var
      args = Array.prototype.slice.call(arguments),
      path = args.shift(),
      next = args.shift(),
      method, params, cb, doCors;

    while (next) {
      var type = typeof next;
      if (type === 'string' && !method) {
        method = next.toLowerCase();
      } else if (type === 'function' && !cb) {
        cb = next;
      } else if (type === 'object' && !params) {
        params = next;
      } else {
        G.log('Invalid argument passed to G.api(): ' + next);
        return;
      }
      next = args.shift();
    }

    method = method || 'get';
    params = params || {};


    // remove prefix slash if one is given, as it's already in the base url
    if (path[0] === '/') {
      path = path.substr(1);
    }

    if (G.Array.indexOf(G.ApiClient.REST_METHODS, method) < 0) {
      G.log('failed on rest methods');
      return; //Need to create a logging mech
    }

    G.ApiClient.corsRequest(path, method, params, cb);

    //    var form = G.ApiClient.createForm(path, method, params);

    //    G.ApiClient.iframeRequest(form, cb);
  },

  corsRequest:function(path, method, params, cb) {
    var isGet = method.toLowerCase() == "get";
    var queryString = G.QS.encode(params);

    var url = G.endPoint + path;
    if (isGet) {
      url += "?" + queryString;
    }


    var xhr = new XMLHttpRequest();

    if ("withCredentials" in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      throw("corsRequest: cross site xhr not available");
    }


    if (cb) {
      xhr.onload = function() {

        //Custom contentType and standardization of response
        //TODO this goes into our custom XHR object
        if (!xhr.contentType) {
          if (xhr.getResponseHeader)
            xhr.contentType = xhr.getResponseHeader("Content-Type");
        }

        var contentType = xhr.contentType.toLowerCase();
        var response = xhr.responseText;

        //TODO need to parse the json better than with evals.
        //TODO response replace /*s/ is just to fail here if head was called in rails...
        if (contentType.indexOf("application/json") != -1 && response.replace(/\s*/, "")) {
          eval('response = ' + "(" + response + ")"); //ie needs braces
        }

        //For cool kids
        if (xhr.status) {
          //Set flags in xhr denoting success and errors
          xhr.success = !!xhr.status.toString().match(/^2../);
          xhr.clientError = !!xhr.status.toString().match(/^4../);
          xhr.serverError = !!xhr.status.toString().match(/^5../);
        } else { //FUCK YOU IE!!! TODO move to custom xhr object
          xhr.success = !!xhr.responseText;
          xhr.clientError = xhr.serverError = !xhr.responseText;
        }

        cb(response, xhr);
      }
    }

    if (isGet) {
      xhr.send();
    } else {
      //IE 8 doesn't support header
      if (xhr.setRequestHeader) {
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }
      xhr.send(queryString);
    }

  },

  nonCorsDispatch:function(path, method, params, cb) {
    if (method === 'post') {
      var form = G.ApiClient.createForm(path, method, params);
    }

  },

  /**
   *  createForm: Creates a form to submit as a substitute for XHRs.
   *
   * @access private
   * @param path      {String}   the url path
   * @param method    {String}   the http method
   * @param params    {Object}   the parameters for the query
   * @param fullPath  {Boolean}  If the path is a fullpath to a resource
   *
   */

  createForm:function(path, method, params, fullPath) {
    var form = document.createElement('form');

    form.action = (fullPath) ? path : G.endPoint + path;

    form.enctype = "multipart/form-data";
    form.method = method;

    for (var key in params) {
      var input = document.createElement('input');
      input.type = 'hidden'; //DEBUG text
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    }

    return form;
  },

  /**
   * iframeRequest: Submits a form using a spawned Iframe.
   *
   * @access private
   * @param form      {object}   Dom node representing a form for submission
   */
  iframeRequest: function(form, clone) {
    //Prevents form passed in from being destroyed in call.
    if (clone) form = form.cloneNode(true);

    var iframe = document.createElement('iframe');
    iframe.style.display = "none";
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    iframe.style.height = "0px";
    iframe.style.width = "0px";

    document.body.appendChild(iframe); //initializes iframe

    G.iframe = iframe;
    //ie 8 needs document.body everyone else uses contentWindow
    var body = iframe.contentWindow.document.body || iframe.document.body;
    body.appendChild(form);
    form.submit();

    //30 seconds from now clean out that iframe
    setTimeout(function() {
      if (iframe.parentNode)
        iframe.parentNode.removeChild(iframe)
    }, 30000);
  }


});
