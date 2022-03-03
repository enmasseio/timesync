'use strict';

module.exports = typeof fetch !== 'undefined' ? require('./request.browser') : require('./request.node');