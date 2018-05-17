'use strict';

var isBrowser = typeof window !== 'undefined';

// FIXME: how to do conditional loading this with ES6 modules?
module.exports = isBrowser ? require('./request.browser') : require('./request.node');