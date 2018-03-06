var express = require('express');
var timesyncServer = require('../../../server');

var PORT = 8081;

// create an express app
var app = express();
app.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);

// serve static index.html
app.get('/', express.static(__dirname));
app.get('/index.html', express.static(__dirname));

// handle timesync requests
app.use('/timesync', timesyncServer.requestHandler);
