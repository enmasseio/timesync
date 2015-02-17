var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var PORT = 8081;

app.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);

function handler (req, res) {
  console.log('request', req.url);

  if (req.url === '/timesync/timesync.js') {
    res.setHeader('Content-Type', 'application/javascript');
    return sendFile('../../../dist/timesync.js', res);
  }

  if (req.url === '/' || req.url === 'index.html') {
    return sendFile(__dirname + '/index.html', res);
  }

  res.writeHead(404);
  res.end('Not found');
}

io.on('connection', function (socket) {
  socket.on('timesync', function (data) {
    console.log('message', data);
    socket.emit('timesync', {
      id: data && 'id' in data ? data.id : null,
      result: Date.now()
    });
  });
});

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
