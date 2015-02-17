// node.js client

if (typeof global.Promise === 'undefined') {
  global.Promise = require('promise');
}
var timesync = require('../../../dist/timesync');

// create a timesync client
var ts = timesync.create({
  peers: 'http://localhost:8081/timesync',
  interval: 10000
});

// get notified on changes in the offset
ts.on('change', function (offset) {
  console.log('changed offset: ' + offset + ' ms');
});

// get synchronized time
setInterval(function () {
  var now = new Date(ts.now());
  console.log('now: ' + now.toISOString() + ' ms');
}, 1000);