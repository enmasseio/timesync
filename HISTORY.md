# History


## 2020-02-01, version 1.0.5

- Fix handing invalid JSON responses, see #27. Thanks @Poky85.


## 2019-10-12, version 1.0.4

- Move the `dependencies` only used in examples to `devDependencies`:
  `express`, `body-parser`, `socket.io`, promise`. To run the examples,
  you will have to install these dependencies yourself.


## 2018-05-21, version 1.0.3

- Fixed the `send` method passing a wrong parameter to `request.post`.


## 2018-03-07, version 1.0.2

- Fixed a broken example. Thanks @gokayokyay.


## 2018-02-12, version 1.0.1

- Upgraded some dependencies containing security vulnerabilities.


## 2018-02-12, version 1.0.0

- Function `send` now needs to return a Promise, and has to handle
  timeouts itself. This fixes timeouts occurring before xhr success.
  Thanks @DerekKeeler.
- Upgraded dependencies.


## 2017-10-23, version 0.4.2

- Fixed syncing to peers not using custom configuration `now`.
  Thanks @reklawnos.


## 2017-08-19, version 0.4.1

- Made examples robust against a varying working directory.
- Fixed #11: added timeout to http requests to fix infinite
  call / response loops. Thanks @dfeblowitz.


## 2017-06-13, version 0.4.0

- Added support for `https`. Thanks @jaquadro.
- Added a tutorial on how to use `timesync` in Android. Thanks @NicoHerbig.


## 2017-04-08, version 0.3.1

- Fixed a bug where JSON could be truncated on the server.
  Thanks Matt Kincaid.


## 2017-01-25, version 0.3.0

- Deliver ES5 version of the library in lib, bundled files in dist.
  Thanks @electrified.


## 2016-12-15, version 0.2.3

- Fixed some of the browser examples not working on Firefox.


## 2016-12-10, version 0.2.2

- Fixed library not working as part of a browserify setup. Thanks @SupremeTechnopriest.
- Fixed `sendTimestamp` not working in an express application. Thanks @SupremeTechnopriest.


## 2016-06-01, version 0.2.1

- Fixed #6: error when loading `timesync` in a node.js client.


## 2015-12-04, version 0.2.0

- Implemented an `'error'` event.
- Fixed unnecessary wait of 1 sec before the new offset is applied.
- Fixed #3: stat.median not using sorted array.


## 2015-02-17, version 0.1.0

- The first usable version.


## 2015-01-26, version 0.0.1

- Library name reserved at npm and bower.
