# timesync

Time synchronization between peers


# Usage scenarios

- client/server:
  - Clients synchronize their time to that of a single server,
    via either http requests or a web socket.
- peer-to-peer:
  - Clients are connected in a (dynamic) peer-to-peer network using peer.js or
    WebRTC and converge to a single, common time in the network.
  - Clients connected to each other via a single channel on PubNub or an other
    publish/subscribe platform, and converge to a single, common time.


# Install

Install via npm:

```
npm install timesync
```

# Use

Example usage:

```js
// create a timesync
var time = timesync({
  peers: [...]
});

// get notified on changes in the offset
time.on('change', function (offset) {
  console.log('offset from system time:', offset, 'ms');
}

// get the synchronized time
console.log('now:', new Date(time.now()));
```

More examples are available in the [/examples](/examples) folder.


# API

## Construction

An instance of timesync is created as:

```js
var time = timesync(options);
```

### Options

The following options are available:

Name       | Type       | Default    | Description
---------- | ---------- | ---------- | ----------------------------------------
`interval` | `number`   | `3600000`  | Interval in milliseconds for running a synchronization. Defaults to 1 hour.
`timeout`  | `number`   | `10000`    | Timeout in milliseconds for requests to fail.
`delay`    | `number`   | `1000`     | Delay in milliseconds between every request sent.
`repeat`   | `number`   | `5`        | Number of times to do a request to every peer.
`peers`    | `string[]` | `[]`       | Array with uri's or id's of the peers to synchronize with.
`now`      | `function` | `Date.now` | Function returning the local system time.

## Methods

Basic usage:

Name                  | Return type | Description
--------------------- | ----------- | ----------------------------------
`now()`               | `number`    | Get the synchronized time. Returns a timestamp. To create a `Date`, call `new Date(time.now())`.
`on(event, callback)` | `Object`    | Register a callback handler for an event. Returns the timesync instance. See section [Events](#events) for more information.
`off(event [, callback])` | `Object`    | Unregister a callback handler for an event. If no callback is provided, all callbacks of this event will be removed. Returns the timesync instance. See section [Events](#events) for more information.
`start()` | none        | Start doing a synchronization every `interval` milliseconds.
`stop()`  | none        | Stop doing a synchronization every `interval` milliseconds.
`sync()`  | none        | Do a synchronization with all peers now.

To be able to send and receive messages from peers, `timesync` needs a transport. To hook up a transport like a websocket or http requests, one has to override the `send(id, data)` method of the `timesync` instance, and has to call `timsync.receive(id, data)` on incoming messages.

Name                  | Return type | Description
--------------------- | ----------- | ----------------------------------
`send(to, data)`      | none        | Send a message to a peer. `to` is the id of the peer, and `data` a JSON object containing the message.
`receive(from, data)` | none        | Receive a message from a peer. `from` is the id of the sender, and `data` a JSON object containing the message.

`timesync` sends messages using the JSON-RPC protocol. A peer sends a message:

```json
{"jsonrpc": "2.0", "id": "12345", "method": "time"}
```

The receiving peer replies with the same id and it's current time:

```json
{"jsonrpc": "2.0", "id": "12345", "result": 1423151204595}
```

The sending peer matches the returned message by id and uses the result to adjust it's offset.


## Events

`timesync` emits events when starting and finishing a synchronization, and when the time offset changes. To listen for events:

```js
time.on('change', function (offset) {
  console.log('offset changed:', offset);
});
```

Available events:

Name     | Description
---------| ----------
`change` | Emitted when the offset is changed. This can only happen during a synchronization. Callbacks are called with the new offset (a number) as argument.
`sync`   | Emitted when a synchronization is started or finished. Callback are called with a value `'start'` or `'end'` as argument.


## Properties

Name      | Type     | Description
--------- | -------- | --------------------------------------------
`offset`  | `number` | The offset from system time in milliseconds.
`options` | `Object` | An object holding all options of the timesync instance. One can safely adjust the options at any time, though some changed options do not have immediate effect (for example a changed `interval` will be applied after the first next synchronization.


# Resources

- [A Stream-based Time Synchronization Technique For Networked Computer Games](http://www.mine-control.com/zack/timesync/timesync.html)
- [Network Time Protocol](http://www.wikiwand.com/en/Network_Time_Protocol)
