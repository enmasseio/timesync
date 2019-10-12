/**
 * Before you can run this example you will have to install some dependencies:
 *
 *     npm install express
 *     npm install body-parser
 */
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var PORT = 8081;

var app = express();
app.use(bodyParser.json()); // for parsing application/json
app.use('/', express.static(__dirname));
app.use('/timesync/', express.static(path.join(__dirname, '/../../../dist')));

app.post('/timesync', function (req, res) {
  var data = {
    id: (req.body && 'id' in req.body) ? req.body.id : null,
    result: Date.now()
  };
  res.json(data);
});

app.listen(PORT);
console.log('Server listening at http://localhost:' + PORT);
