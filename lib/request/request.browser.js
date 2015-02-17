export function fetch (method, url, body, headers, callback) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        var contentType = xhr.getResponseHeader('Content-Type');
        if (contentType.indexOf('json') !== -1) {
          // return JSON object
          callback(null, JSON.parse(xhr.responseText), xhr.status);
        }
        else {
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

    xhr.open(method, url, true);

    if (typeof body === 'string') {
      xhr.send(body);
    }
    else if (body) { // body is an object
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(body));
    }
    else {
      xhr.send();
    }
  }
  catch (err) {
    callback(err, null, 0);
  }
}

export function post (url, body, callback) {
  fetch('POST', url, body, null, callback)
}
