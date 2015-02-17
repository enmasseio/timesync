var timesyncServer = require('../../../server');

var PORT = 8081;

// Create a new, dedicated server and start listening on the configured port
var server = timesyncServer.createServer();
server.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);

// Alternatively, a plain http server can be created like:
//     var http = require('http');
//     var server = http.createServer(timesyncServer.requestHandler);
//     server.listen(PORT);

// Note that this server does not host static files like index.html.
