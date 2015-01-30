/**
 * timesync
 *
 * Time synchronization between peers
 *
 * https://github.com/enmasseio/timesync
 */

import * as stat from './stat.js';
import emitter from './emitter.js';

/**
 * Factory function to create a timesync instance
 * @param {Object} [options]  TODO: describe options
 * @return {Object} Returns a new timesync instance
 */
export function create(options) {
  var timesync = {
    options: {
      id: 'timesync_' + Math.round(Math.random() * 1e5),
      interval: 60 * 60 * 1000, // ms
      timeout: 10000, // ms
      delay: 1000, // ms
      repeat: 5,
      peers: [],
      now: Date.now
    },

    /** @type {number} */
    offset: 0, // ms

    /** @type {number} */
    timeout: null,

    /** @type {Object.<string, function>} */
    inProgress: {},

    /**
     * Send a message to a peer
     * This method must be overridden when using timesync
     * @param {string} to
     * @param {*} data
     */
    send: function (to, data) {
      throw new Error('Cannot execute abstract method send');
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
      }
      else if (data && data.id !== undefined) {
        // this is a request from an other peer
        // reply with our current time
        timesync.send(from, {
          id: data.id,
          result: timesync.now()
        })
      }
    },

    /**
     * Send a JSON-RPC message and retrieve a response
     * @param {string} to
     * @param {string} method
     * @param {*} params
     * @returns {Promise}
     */
    rpc: function (to, method, params) {
      return new Promise(function (resolve, reject) {
        var id = nextId();

        var timeout = setTimeout(function () {
          delete timesync.inProgress[id];
          reject(new Error('Timeout'));
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
      timesync.emit('sync');

      var peers = timesync.options.peers;
      return Promise
          .all(peers.map(peer => timesync._syncWithPeer(peer)))
          .then(function () {
            timesync.emit('offset', timesync.offset);
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
      // retrieve an offset of the peer after a delay of 1 sec
      function sync() {
        var delay = timesync.options.delay;
        return wait(delay).then(() => timesync._retrieveOffset(peer));
      }

      var count = timesync.options.repeat;
      return repeat(sync, count)
          .then(function (all) {
            // filter out null results
            var results = all.filter(result => result !== null);

            // calculate the limit for outliers
            var roundtrips = results.map(result => result.roundtrip);
            var limit = stat.median(roundtrips) + stat.std(roundtrips);

            // filter all results which have a roundtrip smaller than the mean+std
            var filtered = results.filter(result => result.roundtrip < limit);
            var offsets = filtered.map(result => result.offset);

            // apply the new offset
            if (offsets.length > 0) {
              timesync.offset = stat.mean(offsets);
              return timesync.offset;
            }
            return null;
          });
    },

    /**
     * Retrieve the offset from one peer by doing a single call to the peer
     * @param {string} peer
     * @returns {Promise.<{roundtrip: number, offset: number} | null>}
     * @private
     */
    _retrieveOffset: function (peer) {
      var start = Date.now(); // local system time

      return timesync.rpc(peer, 'ping')
          .then(function (timestamp) {
            var end = Date.now(); // local system time
            var roundtrip = end - start;
            return {
              roundtrip: roundtrip,
              offset: timestamp - end + roundtrip / 2 // offset from local system time
            };
          })
          .catch(function (err) {
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
      timesync.running = true;

      timesync
          .sync()
          .then(function () {
            timesync.timeout = setTimeout(function () {
              if (timesync.running) {
                timesync.start();
              }
            }, timesync.options.interval);
          });
    },

    /**
     * Stop synchronizing once per interval
     */
    stop: function () {
      clearTimeout(timesync.timeout);
      timesync.timeout = null;
      timesync.running = false;
    },

    running: false
  };

  // apply provided options
  if (options) {
    for (var prop in options) {
      timesync.options[prop] = options[prop];
    }
  }

  // turn into an event emitter
  emitter(timesync);

  // start a timer to synchronize once per interval
  wait(0).then(timesync.start);

  return timesync;
}

/**
 * Resolve a promise after a delay
 * @param {number} delay    A delay in milliseconds
 * @returns {Promise} Resolves after given delay
 */
function wait(delay) {
  return new Promise(function (resolve) {
    setTimeout(resolve, delay);
  });
}

/**
 * Repeat a given asynchronous function a number of times
 * @param {function} fn   A function returning a promise
 * @param {number} times
 * @return {Promise}
 */
function repeat(fn, times) {
  return new Promise(function (resolve, reject) {
    var count = 0;
    var results = [];

    function recurse() {
      if (count < times) {
        count++;
        fn().then(function (result) {
          results.push(result);
          recurse();
        })
      }
      else {
        resolve(results);
      }
    }

    recurse();
  });
}

/**
 * Simple id generator
 * @returns {number} Returns a new id
 */
function nextId() {
  return _id++;
}
var _id = 0;
