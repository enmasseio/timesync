/**
 * Create a peer with id, and connect to the given peers
 * @param {string} id
 * @param {string[]} peers
 * @return {{peer: Window.Peer, ts: Object}} Returns an object with the
 *                                           created peer and the timesync
 */
function connect(id, peers) {
  var divSystemTime = document.getElementById('systemTime');
  var divSyncTime = document.getElementById('syncTime');
  var divOffset = document.getElementById('offset');

  var ts = timesync.create({
    peers: [], // start empty, will be updated at the start of every synchronization
    interval: 5000,
    timeout: 1000
  });

  ts.on('sync', function (state) {
    console.log('sync ' + state);
    if (state == 'start') {
      ts.options.peers = openConnections();
      console.log('syncing with peers [' + ts.options.peers.join(', ') + ']');
    }
  });

  ts.on('change', function (offset) {
    console.log('changed offset: ' + offset);
    divOffset.innerHTML = offset.toFixed(1) + ' ms';
  });

  ts.send = function (id, data) {
    //console.log('send', id, data);
    var all = peer.connections[id];
    var conn = all && all.filter(function (conn) {
      return conn.open;
    })[0];

    if (conn) {
      conn.send(data);
    }
    else {
      console.log(new Error('Cannot send message: not connected to ' + id).toString());
    }
  };

  // show the system time and synced time once a second on screen
  setInterval(function () {
    divSystemTime.innerHTML = new Date().toISOString().replace(/[A-Z]/g, ' ');
    divSyncTime.innerHTML   = new Date(ts.now()).toISOString().replace(/[A-Z]/g, ' ');
  }, 1000);

  // Create a new Peer with the demo API key
  //var peer = new Peer(id, {key: 'lwjd5qra8257b9', debug: 1});
  var peer = new Peer(id, {key: 'bbmqr0jowdtgwrk9', debug: 1});
  peer.on('open', connectToPeers);
  peer.on('connection', setupConnection);

  function openConnections() {
    return Object.keys(peer.connections).filter(function (id) {
      return peer.connections[id].some(function (conn) {
        return conn.open;
      });
    });
  }

  function connectToPeers() {
    peers
        .filter(function (id) {
          return peer.connections[id] === undefined;
        })
        .forEach(function (id) {
          console.log('connecting with ' + id + '...');
          var conn = peer.connect(id);
          setupConnection(conn);
        });
  }

  function setupConnection(conn) {
    conn
        .on('open', function () {
          console.log('connected with ' + conn.peer);
        })
        .on('data', function(data) {
          //console.log('receive', conn.peer, data);
          ts.receive(conn.peer, data);
        })
        .on('close', function () {
          console.log('disconnected from ' + conn.peer);
        })
        .on('error', function (err) {
          console.log('Error', err);
        });
  }

  // check whether there are connections missing every 10 sec
  setInterval(connectToPeers, 10000);

  return {
    peer: peer,
    ts: ts
  };
}
