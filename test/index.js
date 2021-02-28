const test = require('tap').test
const path = require('path')
const async = require('async')
const nano = require('nano')

const configure = require('../')

const url = process.env.COUCH || 'http://localhost:5984'
const couch = nano(url)

// get couchdb version to set _config path
const configPaths = []
couch.request({ path: '' }, (error, result) => {
  if (error) { throw error }
  if (result.version > '2') {
    couch.request({ path: '_membership' }, (error, result) => {
      if (error) { throw error }
      for (const node of result.all_nodes) {
        configPaths.push(`_node/${node}/_config/`)
      }
    })
  } else {
    configPaths.push('_config/')
  }
})

function setConfig (options, done) {
  async.map(configPaths, (configPath, done) => {
    const path = `${configPath}/${options.path}`
    couch.request({ ...options, path }, done)
  }, done)
}

// There is an issue with section deletion in CouchDB.
// You cannot delete an entire section:
// $ curl -XDELETE http://localhost:5984/_config/couchdb-bootstrap
// {"error":"method_not_allowed","reason":"Only GET,PUT,DELETE allowed"}
function clear (callback) {
  setConfig({ path: 'couchdb-configure' }, function (error, configs) {
    if (error) return callback(error)
    const config = configs[0]

    async.map(Object.keys(config), function (key, next) {
      setConfig({
        method: 'DELETE',
        path: `couchdb-configure/${encodeURIComponent(key)}`
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

      setConfig({
        path: 'couchdb-configure/foo'
      }, function (error, configs) {
        const config = configs[0]
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

      setConfig({
        path: 'couchdb-configure/baz'
      }, function (error, configs) {
        const config = configs[0]
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

      setConfig({
        path: 'couchdb-configure/bar'
      }, function (error, configs) {
        const config = configs[0]
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

      setConfig({
        path: 'couchdb-configure/foo'
      }, function (error, configs) {
        const config = configs[0]
        t.error(error)
        t.equal(config, 'bar')
        t.end()
      })
    })
  })
})
