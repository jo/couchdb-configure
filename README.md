# CouchDB Configure
Configure CouchDB database server from filesystem.

[![Build
Status](https://travis-ci.org/eHealthAfrica/couchdb-configure.svg?branch=master)](https://travis-ci.org/eHealthAfrica/couchdb-configure)

`source` is processed by [couch-compile](https://github.com/jo/couch-compile),
so you can use a json file, node module or filesystem mapping.

## API

```js
var configure = require('couchdb-configure')
configure('http://localhost:5984', 'couchdb/config.json', function(error, response) {
  // here we go
})
```

## CLI

```sh
couchdb-configure http://localhost:5984 couchdb/config.json
```

## Tests
```sh
npm test
```
