# CouchDB Configure
Configure CouchDB database server from filesystem.

[![Build
Status](https://travis-ci.org/eHealthAfrica/couchdb-configure.svg?branch=master)](https://travis-ci.org/eHealthAfrica/couchdb-configure)

## API

```js
configure(url, source[, options], callback)
```

* `url` - CouchDB server URL
* `source` -  Can be a  Couchapp Directory Tree, JSON file or CommonJS/Node module. Please see [couchdb-compile](https://github.com/jo/couchdb-compile) for in depth information about source handling.
* `callback` - called when done with a `response` object describing the status of all operations.

### Example

```js
var configure = require('couchdb-configure')
configure('http://localhost:5984', 'couchdb/config.json', function(error, response) {
  // here we go
})
```

## CLI

```sh
couchdb-configure URL [SOURCE]
```

When `SOURCE` is omitted, the current directory will be used.


### Example

```sh
couchdb-configure http://localhost:5984 couchdb/config.json
```

## Tests
```sh
npm test
```
