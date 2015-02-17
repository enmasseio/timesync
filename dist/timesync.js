!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.timesync=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * Turn an object into an event emitter. Attaches methods `on`, `off`,
 * `emit`, and `list`
 * @param {Object} obj
 * @return {Object} Returns the original object, extended with emitter functions
 */
module.exports = emitter;
function emitter(obj) {
  var _callbacks = {};

  obj.emit = function (event, data) {
    var callbacks = _callbacks[event];
    callbacks && callbacks.forEach(function (callback) {
      return callback(data);
    });
  };

  obj.on = function (event, callback) {
    var callbacks = _callbacks[event] || (_callbacks[event] = []);
    callbacks.push(callback);
    return obj;
  };

  obj.off = function (event, callback) {
    if (callback) {
      var callbacks = _callbacks[event];
      var index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        delete _callbacks[event];
      }
    } else {
      delete _callbacks[event];
    }
    return obj;
  };

  obj.list = function (event) {
    return _callbacks[event] || [];
  };

  return obj;
}

},{}],2:[function(require,module,exports){
"use strict";

exports.fetch = fetch;
exports.post = post;
function fetch(method, url, body, headers, callback) {
  try {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState == 4) {
        var contentType = xhr.getResponseHeader("Content-Type");
        if (contentType.indexOf("json") !== -1) {
          // return JSON object
          callback(null, JSON.parse(xhr.responseText), xhr.status);
        } else {
          // return text
          callback(null, xhr.responseText, xhr.status);
        }
      }
    };
    if (headers) {
      for (var name in headers) {
        if (headers.hasOwnProperty(name)) {
          xhr.setRequestHeader(name, headers[name]);
        }
      }
    }

    xhr.open(method, url, true);

    if (typeof body === "string") {
      xhr.send(body);
    } else if (body) {
      // body is an object
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(body));
    } else {
      xhr.send();
    }
  } catch (err) {
    callback(err, null, 0);
  }
}

function post(url, body, callback) {
  fetch("POST", url, body, null, callback);
}
exports.__esModule = true;

},{}],3:[function(require,module,exports){
"use strict";

var isBrowser = typeof window !== "undefined";

// FIXME: how to do conditional loading this with ES6 modules?
module.exports = isBrowser ? require("./request.browser") : require("./request.node");

},{"./request.browser":2,"./request.node":4}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.post = post;
var http = _interopRequire(require("http"));

var url = _interopRequire(require("url"));

var parseUrl = url.parse;

function post(url, body, callback) {
  var data = body === "string" ? body : JSON.stringify(body);
  var urlObj = parseUrl(url);

  // An object of options to indicate where to post to
  var options = {
    host: urlObj.hostname,
    port: urlObj.port,
    path: urlObj.path,
    method: "POST",
    headers: { "Content-Length": data.length }
  };

  if (body !== "string") {
    options.headers["Content-Type"] = "application/json";
  }

  var req = http.request(options, function (res) {
    res.setEncoding("utf8");
    res.on("data", function (data) {
      var contentType = res.headers["content-type"];
      var isJSON = contentType && contentType.indexOf("json") !== -1;
      var body = isJSON ? JSON.parse(data) : data;

      callback && callback(null, body, res.statusCode);
      callback = null;
    });
  });

  req.on("error", function (err) {
    callback && callback(err, null, null);
    callback = null;
  });

  req.write(data);
  req.end();
}
exports.__esModule = true;

},{"http":undefined,"url":undefined}],5:[function(require,module,exports){
"use strict";

// basic statistical functions

exports.compare = compare;
exports.add = add;
exports.sum = sum;
exports.mean = mean;
exports.std = std;
exports.variance = variance;
exports.median = median;
function compare(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

function add(a, b) {
  return a + b;
}

function sum(arr) {
  return arr.reduce(add);
}

function mean(arr) {
  return sum(arr) / arr.length;
}

function std(arr) {
  return Math.sqrt(variance(arr));
}

function variance(arr) {
  if (arr.length < 2) return 0;

  var _mean = mean(arr);
  return arr.map(function (x) {
    return Math.pow(x - _mean, 2);
  }).reduce(add) / (arr.length - 1);
}

function median(arr) {
  if (arr.length < 2) return arr[0];

  var sorted = arr.slice().sort(compare);
  if (sorted.length % 2 === 0) {
    // even
    return (arr[arr.length / 2 - 1] + arr[arr.length / 2]) / 2;
  } else {
    // odd
    return arr[(arr.length - 1) / 2];
  }
}
exports.__esModule = true;

},{}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

/**
 * Factory function to create a timesync instance
 * @param {Object} [options]  TODO: describe options
 * @return {Object} Returns a new timesync instance
 */
exports.create = create;
/**
 * timesync
 *
 * Time synchronization between peers
 *
 * https://github.com/enmasseio/timesync
 */

var util = _interopRequireWildcard(require("./util.js"));

var stat = _interopRequireWildcard(require("./stat.js"));

var request = _interopRequireWildcard(require("./request/request"));

var emitter = _interopRequire(require("./emitter.js"));

function create(options) {
  var timesync = {
    // configurable options
    options: {
      interval: 60 * 60 * 1000, // interval for doing synchronizations in ms. Set to null to disable auto sync
      timeout: 10000, // timeout for requests to fail in ms
      delay: 1000, // delay between requests in ms
      repeat: 5, // number of times to do a request to one peer
      peers: [], // uri's or id's of the peers
      server: null, // uri of a single server (master/slave configuration)
      now: Date.now // function returning the system time
    },

    /** @type {number} The current offset from system time */
    offset: 0, // ms

    /** @type {number} Contains the timeout for the next synchronization */
    _timeout: null,

    /** @type {Object.<string, function>} Contains a map with requests in progress */
    _inProgress: {},

    /**
     * @type {boolean}
     * This property used to immediately apply the first ever received offset.
     * After that, it's set to false and not used anymore.
     */
    _isFirst: true,

    /**
     * Send a message to a peer
     * This method must be overridden when using timesync
     * @param {string} to
     * @param {*} data
     */
    send: function (to, data) {
      try {
        request.post(to, data, function (err, res) {
          if (err) {
            console.log("Error", err);
          } else {
            timesync.receive(to, res);
          }
        });
      } catch (err) {
        console.log("Error", err);
      }
    },

    /**
     * Receive method to be called when a reply comes in
     * @param {string | undefined} [from]
     * @param {*} data
     */
    receive: function (from, data) {
      if (data === undefined) {
        data = from;
        from = undefined;
      }

      if (data && data.id in timesync._inProgress) {
        // this is a reply
        timesync._inProgress[data.id](data.result);
      } else if (data && data.id !== undefined) {
        // this is a request from an other peer
        // reply with our current time
        timesync.send(from, {
          jsonrpc: "2.0",
          id: data.id,
          result: timesync.now()
        });
      }
    },

    /**
     * Send a JSON-RPC message and retrieve a response
     * @param {string} to
     * @param {string} method
     * @param {*} [params]
     * @returns {Promise}
     */
    rpc: function (to, method, params) {
      return new Promise(function (resolve, reject) {
        var id = util.nextId();

        var timeout = setTimeout(function () {
          delete timesync._inProgress[id];
          reject(new Error("Timeout"));
        }, timesync.options.timeout);

        timesync._inProgress[id] = function (data) {
          clearTimeout(timeout);
          delete timesync._inProgress[id];

          resolve(data);
        };

        timesync.send(to, {
          jsonrpc: "2.0",
          id: id,
          method: method,
          params: params
        });
      });
    },

    /**
     * Synchronize now with all configured peers
     * Docs: http://www.mine-control.com/zack/timesync/timesync.html
     */
    sync: function () {
      timesync.emit("sync", "start");

      var peers = timesync.options.server ? [timesync.options.server] : timesync.options.peers;
      return Promise.all(peers.map(function (peer) {
        return timesync._syncWithPeer(peer);
      })).then(function (all) {
        var offsets = all.filter(function (offset) {
          return timesync._validOffset(offset);
        });
        if (offsets.length > 0) {
          // take the average of all peers (excluding self) as new offset
          timesync.offset = stat.mean(offsets);
          timesync.emit("change", timesync.offset);
        }
        timesync.emit("sync", "end");
      });
    },

    /**
     * Test whether given offset is a valid number (not NaN, Infinite, or null)
     * @param {number} offset
     * @returns {boolean}
     * @private
     */
    _validOffset: function (offset) {
      return offset !== null && !isNaN(offset) && isFinite(offset);
    },

    /**
     * Sync one peer
     * @param {string} peer
     * @return {Promise.<number | null>}  Resolves with the offset to this peer,
     *                                    or null if failed to sync with this peer.
     * @private
     */
    _syncWithPeer: function (peer) {
      // retrieve the offset of a peer, then wait 1 sec
      function syncAndWait() {
        return timesync._getOffset(peer).then(function (result) {
          return util.wait(timesync.options.delay).then(function () {
            return result;
          });
        });
      }

      return util.repeat(syncAndWait, timesync.options.repeat).then(function (all) {
        // filter out null results
        var results = all.filter(function (result) {
          return result !== null;
        });

        // calculate the limit for outliers
        var roundtrips = results.map(function (result) {
          return result.roundtrip;
        });
        var limit = stat.median(roundtrips) + stat.std(roundtrips);

        // filter all results which have a roundtrip smaller than the mean+std
        var filtered = results.filter(function (result) {
          return result.roundtrip < limit;
        });
        var offsets = filtered.map(function (result) {
          return result.offset;
        });

        // return the new offset
        return offsets.length > 0 ? stat.mean(offsets) : null;
      });
    },

    /**
     * Retrieve the offset from one peer by doing a single call to the peer
     * @param {string} peer
     * @returns {Promise.<{roundtrip: number, offset: number} | null>}
     * @private
     */
    _getOffset: function (peer) {
      var start = Date.now(); // local system time

      return timesync.rpc(peer, "timesync").then(function (timestamp) {
        var end = Date.now(); // local system time
        var roundtrip = end - start;
        var offset = timestamp - end + roundtrip / 2; // offset from local system time

        // apply the first ever retrieved offset immediately.
        if (timesync._isFirst) {
          timesync._isFirst = false;
          timesync.offset = offset;
          timesync.emit("change", offset);
        }

        return {
          roundtrip: roundtrip,
          offset: offset
        };
      })["catch"](function (err) {
        // just ignore failed requests, return null
        return null;
      });
    },

    /**
     * Get the current time
     * @returns {number} Returns a timestamp
     */
    now: function () {
      return timesync.options.now() + timesync.offset;
    },

    /**
     * Destroy the timesync instance. Stops automatic synchronization.
     * If timesync is currently executing a synchronization, this
     * synchronization will be finished first.
     */
    destroy: function () {
      clearTimeout(timesync._timeout);
    }
  };

  // apply provided options
  if (options) {
    if (options.server && options.peers) {
      throw new Error("Configure either option \"peers\" or \"server\", not both.");
    }

    for (var prop in options) {
      if (options.hasOwnProperty(prop)) {
        if (prop === "peers" && typeof options.peers === "string") {
          // split a comma separated string with peers into an array
          timesync.options.peers = options.peers.split(",").map(function (peer) {
            return peer.trim();
          }).filter(function (peer) {
            return peer !== "";
          });
        } else {
          timesync.options[prop] = options[prop];
        }
      }
    }
  }

  // turn into an event emitter
  emitter(timesync);

  if (timesync.options.interval !== null) {
    // start an interval to automatically run a synchronization once per interval
    timesync._timeout = setInterval(timesync.sync, timesync.options.interval);

    // synchronize immediately on the next tick (allows to attach event
    // handlers before the timesync starts).
    setTimeout(timesync.sync, 0);
  }

  return timesync;
}
exports.__esModule = true;

},{"./emitter.js":1,"./request/request":3,"./stat.js":5,"./util.js":7}],7:[function(require,module,exports){
"use strict";

/**
 * Resolve a promise after a delay
 * @param {number} delay    A delay in milliseconds
 * @returns {Promise} Resolves after given delay
 */
exports.wait = wait;


/**
 * Repeat a given asynchronous function a number of times
 * @param {function} fn   A function returning a promise
 * @param {number} times
 * @return {Promise}
 */
// TODO: replace with a more generic whilst(condition, callback) routine?
exports.repeat = repeat;


/**
 * Simple id generator
 * @returns {number} Returns a new id
 */
exports.nextId = nextId;
function wait(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}function repeat(fn, times) {
  return new Promise(function (resolve, reject) {
    var count = 0;
    var results = [];

    function recurse() {
      if (count < times) {
        count++;
        fn().then(function (result) {
          results.push(result);
          recurse();
        });
      } else {
        resolve(results);
      }
    }

    recurse();
  });
}function nextId() {
  return _id++;
}
var _id = 0;
exports.__esModule = true;

},{}]},{},[6])(6)
});