var fs = require('fs');
var http = require('http');
var debug = require('debug')('timesync');

/**
 * Create a http server for time synchronization
 * @return {http.Server}      Returns the server instance.
 */
exports.createServer = function () {
  // create a new server
  debug('creating a new server');
  return http.createServer(exports.requestHandler);
};

/**
 * Attaches a timesync request hander to an existing server
 *
 * Implementation based on code from socket.io
 * https://github.com/Automattic/socket.io/blob/master/lib/index.js
 *
 * @param {http.Server} server    http server
 * @param {string} [path]         optional path, `/timesync` by default
 */
exports.attachServer = function (server, path) {
  if (server instanceof http.Server) {
    debug('attach to existing server');

    var listeners = server.listeners('request').slice(0);
    server.removeAllListeners('request');

    var route = createRoute(path);

    server.on('request', function(req, res) {
      var handled = route(req, res);
      if (!handled) {
        listeners.forEach(function (listener) {
          listener.call(server, req, res)
        });
      }
    });
  }
  else {
    throw new TypeError('Instance of http.Server expected');
  }
};

/**
 * Create a route matching whether to apply the timesync's request handler
 * @param {string} [path]         optional path, `/timesync` by default
 */
function createRoute (path) {
  path = path || '/timesync';
  var pattern = new RegExp(path + '($|/(.*))');

  debug('creating request handler listening on path ' + path);

  return function (req, res) {
    if (pattern.exec(req.url)) {
      exports.requestHandler(req, res);
      return true; // handled
    }
    else {
      return false; // not handled
    }
  };
}

/**
 * A request handler for time requests.
 * - In case of POST, an object containing the current timestamp will be
 *   returned.
 * - In case of GET .../timesync.js or GET .../timesync.min.js, the static
 *   files will be returned.
 * @param req
 * @param res
 * @returns {*}
 */
exports.requestHandler = function (req, res) {
  debug('request ' + req.method + ' ' + req.url + ' ' + req.method);

  if (req.method == 'POST') {
    if (!filename) {
      // a time request
      return sendTimestamp(req, res);
    }
  }

  if (req.method == 'GET') {
    var match = req.url.match(/\/(timesync(.min)?.js)$/);
    var filename = match && match[1];
    if (filename === 'timesync.js' || filename === 'timesync.min.js') {
      // static file handler
      return sendFile(res, __dirname + '/../dist/' + filename);
    }
  }

  res.writeHead(404);
  res.end('Not found');
};


function sendTimestamp(req, res) {
  if (req.body) {
    // express.js or similar
    sendTimeStampResponse(res, req.body);
  }
  else {
    // node.js
    readRequestBody(req, function (err, body) {
      sendTimeStampResponse(res, body);
    });
  }
}

function readRequestBody (req, callback) {
  var body = '';
  req.on('data', function (data) {
    body += data;

    // Too much POST data, kill the connection!
    if (body.length > 1e6) {
      callback(new Error('Too much post data. Killing connection...'), null);
      req.connection.destroy();
    }
  });
  req.on('end', function () {
    callback(null, JSON.parse(body));
  });
}

function sendTimeStampResponse (res, body) {

  var data = {
    id: 'id' in body ? body.id : null,
    result: Date.now()
  };

  // Set content-type header
  res.setHeader('Content-Type', 'application/json');

  if(res.status && res.send) {
    // express.js or similar
    res.status(200).send(JSON.stringify(data));
  } else {
    // node.js
    res.writeHead(200);
    res.end(JSON.stringify(data));
  }

}


function sendFile(res, filename) {
  debug('serve static file ' + filename);
  fs.readFile(filename, function (err, data) {
    if (err) {
      res.writeHead(500);
      res.end('Error loading ' + filename.split('/').pop());
    }
    else {
      // note: content type depends on type of file,
      //       but in this case we only serve javascript files
      //       so we just hard code the Content-Type to application/javascript
      res.setHeader('Content-Type', 'application/javascript');
      res.writeHead(200);
      res.end(data);
    }
  });
}
