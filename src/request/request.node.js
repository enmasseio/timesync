import http from 'http';
import https from 'https';
import url from 'url';
var parseUrl = url.parse;

export function post (url, body, timeout) {
  return new Promise(function (resolve, reject) {
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

    var proto = urlObj.protocol === 'https:' ? https : http;

    var req = proto.request(options, function(res) {
      res.setEncoding('utf8');
      var result = '';
      res.on('data', function (data) {
        result += data;
      });

      res.on('end', function () {
        var contentType = res.headers['content-type'];
        var isJSON = contentType && contentType.indexOf('json') !== -1;

        try {
          var body = isJSON ? JSON.parse(result) : result;

          resolve([body, res.statusCode]);
        } catch (err) {
          reject(err)
        }
      });
    });

    req.on('error', reject);

    req.on('socket', function(socket) {
      socket.setTimeout(timeout, function() {
        req.abort();
      });
    });

    req.write(data);
    req.end();
  });
}
