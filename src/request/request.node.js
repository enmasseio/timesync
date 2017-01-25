import http from 'http';
import url from 'url';
var parseUrl = url.parse;

export function post (url, body, callback) {
  var data = (body === 'string') ? body : JSON.stringify(body);
  var urlObj = parseUrl(url);

  // An object of options to indicate where to post to
  var options = {
    host: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.path,
    method: 'POST',
    headers: {'Content-Length': data.length}
  };

  if (body !== 'string') {
    options.headers['Content-Type'] = 'application/json';
  }

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (data) {
      var contentType = res.headers['content-type'];
      var isJSON = contentType && contentType.indexOf('json') !== -1;
      var body = isJSON ? JSON.parse(data) : data;

      callback && callback(null, body, res.statusCode);
      callback = null;
    });
  });

  req.on('error', function(err) {
    callback && callback(err, null, null);
    callback = null;
  });

  req.write(data);
  req.end();
}
