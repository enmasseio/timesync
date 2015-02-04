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
  };

  obj.list = function (event) {
    return _callbacks[event] || [];
  };

  return obj;
}

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

var emitter = _interopRequire(require("./emitter.js"));

function create(options) {
  var timesync = {
    // configurable options
    options: {
      id: "timesync_" + Math.round(Math.random() * 100000), // some semi-random identifier
      interval: 60 * 60 * 1000, // interval for doing synchronizations in ms
      timeout: 10000, // timeout for requests to fail in ms
      delay: 1000, // delay between requests in ms
      repeat: 5, // number of times to do a request to one peer
      peers: [], // uri's or id's of the peers
      now: Date.now // function returning the system time
    },

    /** @type {number} The current offset from system time */
    offset: 0, // ms

    /** @type {number} Contains the timeout for the next synchronization */
    _timeout: null,

    /** @type {Object.<string, function>} Contains a map with requests in progress */
    inProgress: {},

    /**
     * @type {boolean}
     * This property used to immediately apply the first ever received offset.
     * After that, it's set to false and not used anymore.
     */
    _isFirst: true,

    /** @type {boolean} True when running the synchronization every x seconds */
    _running: true,

    /**
     * Send a message to a peer
     * This method must be overridden when using timesync
     * @param {string} to
     * @param {*} data
     */
    send: function (to, data) {
      throw new Error("Cannot execute abstract method send");
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

      if (data && data.id in timesync.inProgress) {
        // this is a reply
        timesync.inProgress[data.id](data.result);
      } else if (data && data.id !== undefined) {
        // this is a request from an other peer
        // reply with our current time
        timesync.send(from, {
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
        var id = nextId();

        var timeout = setTimeout(function () {
          delete timesync.inProgress[id];
          reject(new Error("Timeout"));
        }, timesync.options.timeout);

        timesync.inProgress[id] = function (data) {
          clearTimeout(timeout);
          delete timesync.inProgress[id];

          resolve(data);
        };

        timesync.send(to, {
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

      var peers = timesync.options.peers;
      return Promise.all(peers.map(function (peer) {
        return timesync._syncWithPeer(peer);
      })).then(function (offsets) {
        if (offsets.length > 0) {
          // take the average of all peers (excluding self) as new offset
          timesync.offset = stat.mean(offsets);
          timesync.emit("change", timesync.offset, "final");
        }
        timesync.emit("sync", "end");
      });
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

      return timesync.rpc(peer, "ping").then(function (timestamp) {
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
     * @returns {number}
     */
    now: function () {
      return timesync.options.now() + timesync.offset;
    },

    /**
     * Start synchronizing once per interval
     */
    start: function () {
      timesync._running = true;

      timesync.sync().then(function () {
        timesync._timeout = setTimeout(function () {
          if (timesync._running) {
            timesync.start();
          }
        }, timesync.options.interval);
      });
    },

    /**
     * Stop synchronizing once per interval
     */
    stop: function () {
      clearTimeout(timesync._timeout);
      timesync._timeout = null;
      timesync._running = false;
    }
  };

  // apply provided options
  if (options) {
    for (var prop in options) {
      if (options.hasOwnProperty(prop)) {
        timesync.options[prop] = options[prop];
      }
    }
  }

  // validate configuration
  if (!timesync.options.peers || timesync.options.peers.length === 0) {
    throw new Error("No peers configured");
  }
  if (!Array.isArray(timesync.options.peers)) {
    timesync.options.peers = [timesync.options.peers];
  }

  // turn into an event emitter
  emitter(timesync);

  // start a timer to synchronize once per interval
  setTimeout(function () {
    if (timesync._running) {
      timesync.start();
    }
  }, 0);

  return timesync;
}

/**
 * Simple id generator
 * @returns {number} Returns a new id
 */
function nextId() {
  return _id++;
}
var _id = 0;
exports.__esModule = true;

},{"./emitter.js":1,"./stat.js":2,"./util.js":4}],4:[function(require,module,exports){
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
exports.repeat = repeat;
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
}
exports.__esModule = true;

},{}]},{},[3])(3)
});