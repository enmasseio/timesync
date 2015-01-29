var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

var PORT = 8081;

app.listen(PORT);
console.log('Server listening on port ' + PORT);

function handler (req, res) {
  console.log('request', req.url);

  if (req.url === '/timesync/timesync.js') {
    return sendFile('../../timesync.js', res);
  }

  if (req.url === '/' || req.url === 'index.html') {
    return sendFile(__dirname + '/index.html', res);
  }

  res.writeHead(404);
  res.end('Not found');
}

io.on('connection', function (socket) {
  socket.on('msg', function (data) {
    console.log('message', data)
    socket.emit('msg', {
      id: data && data.id || null,
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
