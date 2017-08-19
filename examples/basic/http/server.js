var fs = require('fs');
var http = require('http');
var timesyncServer = require('../../../server');

var PORT = 8081;

// Create an http server
var server = http.createServer(handler);
server.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);

// Attach a timesync request handler to the server. Optionally, a custom path
// can be provided as second argument (defaults to '/timesync')
timesyncServer.attachServer(server);

// just server a static index.html file
function handler (req, res) {
  sendFile(res, __dirname + '/index.html');
}

function sendFile(res, filename) {
  fs.readFile(filename, function (err, data) {
    if (err) {
      res.writeHead(500);
      res.end('Error loading ' + filename.split('/').pop());
    }
    else {
      res.writeHead(200);
      res.end(data);
    }
  });
}
