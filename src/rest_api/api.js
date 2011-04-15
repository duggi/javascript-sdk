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
  //for richer debugging support, etc
  api: function() {
    G.ApiClient.rest.apply(G.ApiClient, arguments);
  },

  //Allows for posting of forms to remote destinations
  postViaForm: function(path, method, params, fullPath) {
    G.ApiClient.remotePost(path, method, params, fullPath);
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
    method = method.toLowerCase(); //std ize the method

    //Translate all RESTful actions to post and get (ie8 and other browsers)
    if (method == 'put') {
      method = 'post';
      params["_method"] = 'put';
    } else if (method == 'delete') {
      method = 'get';
      params['_method'] = 'delete';
    }

    //Construct the url
    var url = G.endPoint + "/" + path;
    var queryString = G.QS.encode(params); //nestedEncode(params)
    if (method == 'get') {
      url += "?" + queryString;
    }

    //Setup the XHR
    var xhr = new XMLHttpRequest();

    if ("withCredentials" in xhr) {
      xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
      xhr = new XDomainRequest();
      xhr.open(method, url);
    } else {
      throw("corsRequest: cross site xhr not available");
    }

    //The callback
    if (cb) {
      xhr.onload = function() {
        //Custom contentType and standardization of response
        //TODO this goes into our custom XHR object
        if (!xhr.contentType) {
          if (xhr.getResponseHeader) {
            xhr.contentType = xhr.getResponseHeader("Content-Type");
          }
        }

        var contentType = typeof xhr.contentType == 'string' ? xhr.contentType.toLowerCase() : "";
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
      };
      //TODO need to handle the error function for ie
      xhr.onerror = xhr.onload;
    }

    if (method == "get") {
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
   * Handles image uploading in a XD way. Complicated enough that this is
   * a primitive of the API.
   *
   * Our image upload process:
   *
   * Post via form:
   *   In order to upload images we must submit a form via a post request
   *   (ajax doesn't yet support multipart/form-data). We submit this data
   *   to dogfort using the REST route on the form action.
   *
   * Poll S3 with timestamps:
   *   We then poll for the image on S3 (rather than dogfort) to reduce load
   *   on our heroku servers. We have generate a unique timestamp to have
   *   the browser reload the image after uploading 1+ times (otherwise the
   *   same image will be cached in both the browser and possibly the CDN).
   *
   * Format of S3 uploads are always:
   *
   *  https://S3root/modelClassName/modelId/imageName/timestamp/imageSize.png
   *  All images are converted to 24 bit png on dogfort.
   *
   *
   * @param params {Object} Parameters for the function
   *
   * params = {
   *   path:           RESTful path to for model update TODO support image uploads on groupit creation as well
   *   httpMethod:     http method for rails -- defaults to 'PUT'
   *   modelClassName: name of the model this image is attached to
   *   modelId:        if of the model this image is attached to
   *   imageName:      name of image (lead, support, profile, etc)
   *   imageSize:      size of image to check for. (proxy, full, thumb, etc)
   *   s3Root:         the s3 url where to poll for the image (includes protocol)
   *   timeStamp: (optional) defaults to current ms since epoch
   *   start: {Function} Upon initiation of upload this callback is executed
   *   success: (optional Callback)
   *   error: (optional Callback)
   *   complete: (optional Callback)
   *   doc: (optional) defaults to current document
   * }
   *
   * Dear world i apologize for the complexity... (TC) One day i will come
   * back and make it better.
   */

  uploadImageForm: function(params) {
    params = params || {};
    var path = params.path,
      httpMethod = params.httpMethod || 'PUT',
      s3Root = params.s3Root,
      modelClassName = params.modelClassName,
      modelId = params.modelId,
      imageName = params.imageName,
      imageSize = params.imageSize,
      successCb = params.success,
      errorCb = params.error,
      completeCb = params.complete,
      startCb = params.start,
      doc = params.doc || document;

    if (!path || !modelClassName || !httpMethod || !modelId || !imageName || !s3Root) {
      G.log("G.ApiClient.uploadImage: parameters invalid. Failing image upload");
      return null;
    }

    var form = doc.createElement('form'),
      appKeyInput = doc.createElement('input'),
      fileInput = doc.createElement('input'),
      httpMethodInput = doc.createElement("input"),
      stampInput = doc.createElement("input"),
      noResponseInput = doc.createElement("input"),
      hiddenFrame = G.ApiClient.createHiddenIframe(null, doc),
      timestamp = (new Date()).getTime().toString();

    initializeInputs();
    initializeForm();

    function initializeInputs() {
      //Setup the appKeyInput
      appKeyInput.type = "hidden";
      appKeyInput.value = G.appKey;
      appKeyInput.name = "app_key";

      //Setup the fileInput
      fileInput.type = "file";
      fileInput.name = modelClassName + "[" + imageName + "_image" + "]";

      //Setup the httpMethodInput
      httpMethodInput.type = "hidden";
      httpMethodInput.name = "_method";
      httpMethodInput.value = httpMethod;

      //Setup the stampInput
      stampInput.type = "hidden";
      stampInput.name = modelClassName + "[stamp]";
      stampInput.value = timestamp;

      //Tell Dogfort we don't want a response (will cause download dialogs on ie)
      noResponseInput.type = "hidden";
      noResponseInput.name = "no_response";
      noResponseInput.value = "true";

    }

    function initializeForm() {
      //Setup the form properties
      form.enctype = "multipart/form-data";
      form.method = "POST"; //httpMethodInput will drive rails to the correct rest route
      form.target = hiddenFrame.name;
      form.action = path;

      //Append all the form inputs
      form.appendChild(appKeyInput);
      form.appendChild(fileInput);
      form.appendChild(httpMethodInput);
      form.appendChild(appKeyInput);
      form.appendChild(stampInput);
      form.appendChild(noResponseInput);

      form.onsubmit = function() {
        if (startCb) startCb();

        //Setup the image src
        /**
         * Format of S3 uploads are always:
         * s3root included protocol
         * s3root/modelClassName/modelId/imageName/timestamp/imageSize.png
         */
        var src = s3Root + "/" + modelClassName + "/" + modelId +
          "/" + imageName + "/" + timestamp + "/" + imageSize + ".png";
        checkForFile(src);
      };
    }

    function checkForFile(src) {
      var test = testImage(), fails = 0;
      test.src = src;

      //Checks for the image using a series of img elements
      function testImage() {
        var test = doc.createElement("img");
        test.onerror = function() {
          fails++;
          var cacheBustedSrc = src + "?time=" + (new Date()).getTime();
          if (fails > 20) {
            G.log("After Polling for image 20 times we couldn't find the image");
            if (errorCb) errorCb(src);
            if (completeCb) completeCb(src);
            hiddenFrame.parentNode.removeChild(hiddenFrame); //cleanup
            return;
          }
          setTimeout(function() {
            test = testImage();
            test.src = cacheBustedSrc;
          }, 1000);
        };

        test.onload = function() {
          if (successCb) successCb(src);
          if (completeCb) completeCb(src);
          hiddenFrame.parentNode.removeChild(hiddenFrame); //cleanup
        };

        return test;
      }
    }

    return form;
  },

  /**
   * Does a post to a remote location, handles iframe, and form for you.
   *
   * @param path
   * @param method
   * @param params
   * @param fullPath
   */
  remotePost: function(path, method, params, fullPath) {
    var iframe = G.ApiClient.createHiddenIframe(function(iframe, doc) {
      var form = G.ApiClient.createForm(path, method, params, fullPath, doc);
      if (form) {
        doc.body.appendChild(form);
        form.submit();
      }
    });

    //30 seconds from now clean out that iframe
    setTimeout(function() {
      if (iframe.parentNode)
        iframe.parentNode.removeChild(iframe)
    }, 30000);

  },

  /**
   * Creates a hidden frame with a unique name (for targeting).
   *
   * @param {Function} callback
   * @param {Object} doc
   */

  createHiddenIframe: function(callback, doc) {
    doc = doc || document;
    var iframe = doc.createElement('iframe');
    iframe.style.position = "absolute";
    iframe.style.top = "-10000px";
    iframe.style.height = "0px";
    iframe.style.width = "0px";
    iframe.name = "hiddenFrame" + (new Date()).getTime().toString() +
      (Math.floor(Math.random() * 1000001).toString());

    //initializes iframe
    doc.body.appendChild(iframe);
    var iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.close();
    if (callback) callback(iframe, iframeDocument);

    return iframe;
  },

  /**
   *  createForm: Creates a form to submit as a substitute for XHRs.
   *
   * @access private
   * @param path      {String}   the url path
   * @param method    {String}   the http method
   * @param params    {Object}   the parameters for the query
   * @param fullPath  {Boolean}  If the path is a fullpath to a resource
   * @param doc  {Object}[Opt]   A document where the form should be created in
   *
   */

  createForm:function(path, method, params, fullPath, doc) {
    doc = doc || document;
    var form = doc.createElement('form');

    form.action = (fullPath) ? path : G.endPoint + "/" + path;

    form.enctype = "multipart/form-data";
    form.method = method;

    for (var key in params) {
      var input = doc.createElement('input');
      input.type = "hidden"; //'hidden'; //DEBUG text
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    }

    return form;
  }
});
