var test = require('tap').test
var path = require('path')
var async = require('async')
var nano = require('nano')

var configure = require('../')

var url = process.env.COUCH || 'http://localhost:5984'
var couch = nano(url)

// There is an issue with section deletion in CouchDB.
// You cannot delete an entire section:
// $ curl -XDELETE http://localhost:5984/_config/couchdb-bootstrap
// {"error":"method_not_allowed","reason":"Only GET,PUT,DELETE allowed"}
function clear (callback) {
  couch.request({
    path: '_config/couchdb-configure'
  }, function (error, config) {
    if (error) return callback(error)

    async.map(Object.keys(config), function (key, next) {
      couch.request({
        method: 'DELETE',
        path: '_config/couchdb-configure/' + encodeURIComponent(key)
      }, next)
    }, callback)
  })
}

test('use url', function (t) {
  configure(url, path.join(__dirname, 'fixtures', 'config.json'), function (error, responses) {
    t.error(error)
    t.end()
  })
})

test('use url with trailing slash', function (t) {
  configure(url + '/', path.join(__dirname, 'fixtures', 'config.json'), function (error, responses) {
    t.error(error)
    t.end()
  })
})

test('use nano object', function (t) {
  configure(couch, path.join(__dirname, 'fixtures', 'config.json'), function (error, responses) {
    t.error(error)
    t.end()
  })
})

test('configure from json', function (t) {
  clear(function (error) {
    t.error(error)

    configure(url, path.join(__dirname, 'fixtures', 'config.json'), function (error, responses) {
      t.error(error)

      couch.request({
        path: '_config/couchdb-configure/foo'
      }, function (error, config) {
        t.error(error)
        t.equal(config, 'bar')
        t.end()
      })
    })
  })
})

test('configure from commonjs', function (t) {
  clear(function (error) {
    t.error(error)

    configure(url, path.join(__dirname, 'fixtures', 'config.js'), function (error, responses) {
      t.error(error)

      couch.request({
        path: '_config/couchdb-configure/baz'
      }, function (error, config) {
        t.error(error)
        t.equal(config, 'foo')
        t.end()
      })
    })
  })
})

test('configure from commonjs/index', function (t) {
  clear(function (error) {
    t.error(error)

    configure(url, path.join(__dirname, 'fixtures', 'commonjs'), function (error, responses) {
      t.error(error)

      couch.request({
        path: '_config/couchdb-configure/bar'
      }, function (error, config) {
        t.error(error)
        t.equal(config, 'baz')
        t.end()
      })
    })
  })
})

test('configure from filesystem', function (t) {
  clear(function (error) {
    t.error(error)

    configure(url, path.join(__dirname, 'fixtures', 'config'), function (error, responses) {
      t.error(error)

      couch.request({
        path: '_config/couchdb-configure/foo'
      }, function (error, config) {
        t.error(error)
        t.equal(config, 'bar')
        t.end()
      })
    })
  })
})
