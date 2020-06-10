var isBrowser = (typeof document !== 'undefined');
var isReactNative = (typeof navigator !== 'undefined' && navigator.product === 'ReactNative');

// FIXME: how to do conditional loading this with ES6 modules?
module.exports = (isBrowser || isReactNative) ?
    require('./request.browser') :
    require('./request.node');
