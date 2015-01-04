/* gen-run friendly network functions.
 *
 * A lot of this file is taken from:
 * https://github.com/creationix/js-github/blob/master/lib/xhr.js
 * and from other work by https://github.com/creationix
 */
"use strict";

/* usage:
 * gen_run(function*(){
 *   var response = yield* request(uri);
 *   console.log(response);
 * })
 *
 * Optional params:
 * - body: will be sent as is in the body.
 * - options: Object containing extra information:
 *       method: http method. Defaults to GET.
 *       headers: list of [ headername, content ].
 */
export function* request(uri, body = undefined, options = undefined) {
  var done = false;
  var response = 'no response yet';
  var err = undefined;

  var xhr = new XMLHttpRequest();
  xhr.timeout = 2000;
  var method = options? options.method : 'GET'
  xhr.open(method, uri, true);
  if (options && options.headers) {
    for (var header of options.headers)
      xhr.setRequestHeader(...header);
  }
  xhr.ontimeout = onTimeout;
  xhr.onerror = function() {
    done = true
    err = new Error("Error requesting " + uri);
  };

  xhr.onreadystatechange = onReadyStateChange;
  xhr.send(body);

  while (!done) {
    yield sleep(10);
  }

  if (err) throw err;
  return response;

  function onReadyStateChange() {
    if (done) return;
    if (xhr.readyState !== 4) return;
    // Give onTimeout a chance to run first if that's the reason status is 0.
    if (!xhr.status) return setTimeout(onReadyStateChange, 0);
    done = true;
    response = xhr.responseText;
  }

  function onTimeout() {
    if (done) return;
    done = true;
    err = Error("Timeout requesting " + uri);
  }
}

function sleep(ms) {
  return function (callback) {
    setTimeout(callback, ms);
  };
}

