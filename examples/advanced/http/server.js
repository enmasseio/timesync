var app = require('http').createServer(handler);
var fs = require('fs');
var path = require('path');

var PORT = 8081;

app.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);

function handler (req, res) {
  console.log('request', req.url);

  if (req.url === '/timesync/timesync.js') {
    res.setHeader('Content-Type', 'application/javascript');
    return sendFile(path.join(__dirname, '../../../dist/timesync.js'), res);
  }

  if (req.url === '/timesync') {
    if (req.method == 'POST') {
      var body = '';
      req.on('data', function (data) {
        body += data;

        // Too much POST data, kill the connection!
        if (body.length > 1e6) {
          req.connection.destroy();
        }
      });
      req.on('end', function () {
        var input = JSON.parse(body);

        var data = {
          id: 'id' in input ? input.id : null,
          result: Date.now()
        };
        res.writeHead(200);
        res.end(JSON.stringify(data));
      });
    }

    return;
  }

  if (req.url === '/' || req.url === 'index.html') {
    res.setHeader('Content-Type', 'text/html');
    return sendFile(__dirname + '/index.html', res);
  }

  res.writeHead(404);
  res.end('Not found');
}

function sendFile(filename, res) {
  fs.readFile(filename,
      function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading ' + filename.split('/').pop());
        }

        res.writeHead(200);
        res.end(data);
      });
}
