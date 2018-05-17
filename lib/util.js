'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wait = wait;
exports.repeat = repeat;
exports.whilst = whilst;
exports.nextId = nextId;
var Promise = require('./Promise');

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
        });
      } else {
        resolve(results);
      }
    }

    recurse();
  });
}

/**
 * Repeat an asynchronous callback function whilst
 * @param {function} condition   A function returning true or false
 * @param {function} callback    A callback returning a Promise
 * @returns {Promise}
 */
function whilst(condition, callback) {
  return new Promise(function (resolve, reject) {
    function recurse() {
      if (condition()) {
        callback().then(function () {
          return recurse();
        });
      } else {
        resolve();
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