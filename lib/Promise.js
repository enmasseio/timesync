'use strict';

var selfPromise = typeof self !== 'undefined' && typeof self.Promise !== 'undefined' && self.Promise;
var windowPromise = typeof window !== 'undefined' && typeof window.Promise !== 'undefined' && window.Promise;
var selfOrWindowPromise = selfPromise || windowPromise;

module.exports = selfOrWindowPromise ? selfOrWindowPromise : require('promise');