'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fetch = fetch;
exports.post = post;
function fetch(method, url, body, headers, callback, timeout) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var contentType = xhr.getResponseHeader('Content-Type');
        if (contentType && contentType.indexOf('json') !== -1) {
          // return JSON object
          callback(null, JSON.parse(xhr.responseText), xhr.status);
        } else {
          // return text
          callback(null, xhr.responseText, xhr.status);
        }
      }
    };
    if (headers) {
      for (var name in headers) {
        if (headers.hasOwnProperty(name)) {
          xhr.setRequestHeader(name, headers[name]);
        }
      }
    }

    xhr.ontimeout = function (err) {
      callback(err, null, 0);
    };

    xhr.open(method, url, true);
    xhr.timeout = timeout;

    if (typeof body === 'string') {
      xhr.send(body);
    } else if (body) {
      // body is an object
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(body));
    } else {
      xhr.send();
    }
  } catch (err) {
    callback(err, null, 0);
  }
}

function post(url, body, timeout) {
  return new Promise(function (resolve, reject) {
    var callback = function callback(err, res, status) {
      if (err) {
        return reject(err);
      }

      resolve([res, status]);
    };

    fetch('POST', url, body, null, callback, timeout);
  });
}