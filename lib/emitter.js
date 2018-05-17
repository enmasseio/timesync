"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = emitter;
/**
 * Turn an object into an event emitter. Attaches methods `on`, `off`,
 * `emit`, and `list`
 * @param {Object} obj
 * @return {Object} Returns the original object, extended with emitter functions
 */
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