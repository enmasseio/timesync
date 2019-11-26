# timesync

Time synchronization between peers.

Usage scenarios:

- **master/slave**: Clients synchronize their time to that of a single server,
  via either HTTP requests or WebSockets.
- **peer-to-peer**: Clients are connected in a (dynamic) peer-to-peer network
  using WebRTC or WebSockets and must converge to a single, common time in the
  network.


# Install

Install via npm:

```
npm install timesync
```


# Usage

A timesync client can basically connect to one server or multiple peers,
and will synchronize it's time. The synchronized time can be retrieved via
the method `now()`, and the client can subscribe to events like `'change'`
and `'sync'`.

```js
// create a timesync instance
var ts = timesync({
  server: '...',  // either a single server,
  peers: [...]    // or multiple peers
});

// get notified on changes in the offset
ts.on('change', function (offset) {
  console.log('offset from system time:', offset, 'ms');
}

// get the synchronized time
console.log('now:', new Date(ts.now()));
```


# Example

Here a full usage example with express.js, showing both server and client side.
`timesync` has build-in support for requests over http and can be used with
express, a default http server, or other solutions. `timesync` can also be
used over other transports than http, for example using websockets or webrtc.
This is demonstrated in the [advanced examples](/examples/advanced).

More examples are available in the [/examples](/examples) folder.
Some of the examples use libraries like `express` or `socket.io`.
Before you can run these examples you will have to install these dependencies.

**server.js**

```js
var express = require('express');
var timesyncServer = require('timesync/server');

// create an express app
var port = 8081;
var app = express();
app.listen(port);
console.log('Server listening at http://localhost:' + port);

// serve static index.html
app.get('/', express.static(__dirname));

// handle timesync requests
app.use('/timesync', timesyncServer.requestHandler);
```

**index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <!-- note: for support on older browsers, you will need to load es5-shim and es6-shim -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es5-shim/4.0.5/es5-shim.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/es6-shim/0.23.0/es6-shim.min.js"></script>

  <script src="/timesync/timesync.js"></script>
</head>
<script>
  // create a timesync instance
  var ts = timesync.create({
    server: '/timesync',
    interval: 10000
  });

  // get notified on changes in the offset
  ts.on('change', function (offset) {
    document.write('changed offset: ' + offset + ' ms<br>');
  });

  // get synchronized time
  setInterval(function () {
    var now = new Date(ts.now());
    document.write('now: ' + now.toISOString() + ' ms<br>');
  }, 1000);
</script>
</html>
```


# API

## Client

### Construction

An instance of timesync is created as:

```js
var ts = timesync(options);
```

#### Options

The following options are available:

Name       | Type                   | Default    | Description
---------- | ---------------------- | ---------- | ----------------------------------------
`delay`    | `number`               | `1000`     | Delay in milliseconds between every request sent.
`interval` | `number` or `null`     | `3600000`  | Interval in milliseconds for running a synchronization. Defaults to 1 hour. Set to `null` to disable automatically running synchronizations (synchronize by calling `sync()`).
`now`      | `function`             | `Date.now` | Function returning the local system time.
`peers`    | `string[]` or `string` | `[]`       | Array or comma separated string with uri's or id's of the peers to synchronize with. Cannot be used in conjunction with option `server`.
`repeat`   | `number`               | `5`        | Number of times to do a request to every peer.
`server`   | `string`               | none       | Url of a single server in case of a master/slave configuration. Cannot be used in conjunction with option `peers`.
`timeout`  | `number`               | `10000`    | Timeout in milliseconds for requests to fail.

### Methods

Name                  | Return type | Description
--------------------- | ----------- | ----------------------------------
`destroy()`           | none        | Destroy the timesync instance. Stops automatic synchronization. If timesync is currently executing a synchronization, this synchronization will be finished first.
`now()`               | `number`    | Get the synchronized time. Returns a timestamp. To create a `Date`, call `new Date(time.now())`.
`on(event, callback)` | `Object`    | Register a callback handler for an event. Returns the timesync instance. See section [Events](#events) for more information.
`off(event [, callback])` | `Object`    | Unregister a callback handler for an event. If no callback is provided, all callbacks of this event will be removed. Returns the timesync instance. See section [Events](#events) for more information.
`sync()`  | none        | Do a synchronization with all peers now.

To be able to send and receive messages from peers, `timesync` needs a transport. To hook up a transport like a websocket or http requests, one has to override the `send(id, data)` method of the `timesync` instance, and has to call `ts.receive(id, data)` on incoming messages.

Name                                | Return type | Description
----------------------------------- | ----------- | ----------------------------------
`send(to, data, timeout) : Promise` | none        | Send a message to a peer. `to` is the id of the peer, and `data` a JSON object containing the message. Must return a Promise which resolves when the message has been sent, or rejects when sending failed or a timeout occurred.
`receive(from, data)`               | none        | Receive a message from a peer. `from` is the id of the sender, and `data` a JSON object containing the message.

`timesync` sends messages using the JSON-RPC protocol, as described in the section [Protocol](#protocol).


### Events

`timesync` emits events when starting and finishing a synchronization, and when the time offset changes. To listen for events:

```js
ts.on('change', function (offset) {
  console.log('offset changed:', offset);
});
```

Available events:

Name     | Description
---------| ----------
`change` | Emitted when the offset is changed. This can only happen during a synchronization. Callbacks are called with the new offset (a number) as argument.
`error`  | Emitted when an error occurred. Callbacks are called with the error as argument.
`sync`   | Emitted when a synchronization is started or finished. Callback are called with a value `'start'` or `'end'` as argument.


### Properties

Name      | Type     | Description
--------- | -------- | --------------------------------------------
`offset`  | `number` | The offset from system time in milliseconds.
`options` | `Object` | An object holding all options of the timesync instance. One can safely adjust options like `peers` at any time. Not all options can be changed after construction, for example a changed `interval` value will not be applied.


## Server

`timesync` comes with a build in server to serve as a master for time synchronization. Clients can adjust their time to that of the server. The server basically just implements a POST request responding with its current time, and serves the static files `timesync.js` and `timesync.min.js` from the `/dist` folder. It's quite easy to implement this request handler yourself, as is demonstrated in the [advanced examples](/examples/advanced).

The protocol used by the server is described in the section [Protocol](#protocol).

### Load

The server can be loaded in node.js as:

```js
var timesyncServer = require('timesync/server');
```

### Methods

Name                          | Return type  | Description
----------------------------- | ------------ | ----------------------------------
`createServer()`              | `http.Server`| Create a new, dedicated http Server. This is just a shortcut for doing `http.createServer( timesyncServer.requestHandler )`.
`attachServer(server, [path])`| `http.Server`| Attach a request handler for time synchronization requests to an existing http Server. Argument `server` must be an instance of `http.Server`. Argument `path` is optional, and is `/timesync` by default.


### Properties

Name              | Type       | Description
----------------- | ---------- | --------------------------------------------
`requestHandler`  | `function` | A default request handler, handling requests for the timesync server. Signature is `requestHandler(request, response)`. This handler can be used to attach to an expressjs server, or to create a plain http server by doing `http.createServer( timesyncServer.requestHandler )`.


# Protocol

`timesync` sends messages using the JSON-RPC protocol. A peer sends a message:

```json
{"jsonrpc": "2.0", "id": "12345", "method": "timesync"}
```

The receiving peer replies with the same id and its current time:

```json
{"jsonrpc": "2.0", "id": "12345", "result": 1423151204595}
```

The sending peer matches the returned message by id and uses the result to adjust it's offset.


# Algorithm

`timesync` uses a simple synchronization protocol aimed at the gaming industry, and extends this for peer-to-peer networks. The algorithm is described [here](http://www.mine-control.com/zack/timesync/timesync.html):

> A simple algorithm with these properties is as follows:
>
> 1. Client stamps current local time on a "time request" packet and sends to server
> 2. Upon receipt by server, server stamps server-time and returns
> 3. Upon receipt by client, client subtracts current time from sent time and divides by two to compute latency. It subtracts current time from server time to determine client-server time delta and adds in the half-latency to get the correct clock delta. (So far this algorithm is very similar to SNTP)
> 4. The first result should immediately be used to update the clock since it will get the local clock into at least the right ballpark (at least the right timezone!)
> 5. The client repeats steps 1 through 3 five or more times, pausing a few seconds each time. Other traffic may be allowed in the interim, but should be minimized for best results
> 6. The results of the packet receipts are accumulated and sorted in lowest-latency to highest-latency order. The median latency is determined by picking the mid-point sample from this ordered list.
> 7. All samples above approximately 1 standard-deviation from the median are discarded and the remaining samples are averaged using an arithmetic mean.

This algorithm assumes multiple clients synchronizing with a single server. In case of multiple peers, `timesync` will take the average offset of all peers (excluding itself) as offset.


# Tutorials

- [Using the timesync library in Android applications](https://github.com/enmasseio/timesync/blob/master/docs/android-tutorial.md)


# Resources

- [A Stream-based Time Synchronization Technique For Networked Computer Games](http://www.mine-control.com/zack/timesync/timesync.html)
- [Network Time Protocol](http://www.wikiwand.com/en/Network_Time_Protocol)


# Build

To build the library:

    npm install
    npm run build

This will generate the files `timesync.js` and `timesync.min.js` in the folder `/dist`.

To automatically build on changes, run:

    npm run watch
