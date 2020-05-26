var nanoOption = require('nano-option')
var async = require('async')
var compile = require('couchdb-compile')
var assert = require('assert')

module.exports = function configure (url, source, callback) {
  var couch = nanoOption(url)

  assert(typeof couch.request === 'function',
    'URL must point to the root of a CouchDB server (not to a database).')

  async.waterfall([
    (done) => {
      async.series([
        (done) => {
          couch.request({ path: '' }, (error, result) => {
            if (error) { return done(error) }
            return done(null, result.version)
          })
        },
        (done) => {
          async.waterfall([
            compile.bind(null, source, { index: true }),
            (config, done) => {
              var settings = Object.keys(config)
                .reduce(function (memo, key) {
                  if (typeof config[key] !== 'object') return memo

                  var section = Object.keys(config[key])
                    .map(function (k) {
                      return {
                        path: encodeURIComponent(key) + '/' + encodeURIComponent(k),
                        value: config[key][k].toString()
                      }
                    })

                  return memo.concat(section)
                }, [])
              return done(null, settings)
            }
          ], done)
        }
      ], done)
    },
    ([ version, settings ], done) => {
      function writeConfig (configPath, done) {
        async.map(settings, (setting, done) => {
          couch.request({
            method: 'PUT',
            path: configPath + setting.path,
            body: setting.value
          }, function (error, oldValue) {
            if (error) return done(error)

            done(null, {
              path: setting.path,
              value: setting.value,
              oldValue: oldValue
            })
          })
        }, done)
      }
      if (version > '2') {
        couch.request({
          path: '_membership'
        }, function (error, result) {
          if (error) { return done(error) } else {
            const configTasks = result.all_nodes.map((node) => {
              return writeConfig.bind(null, `_node/${node}/_config/`)
            })
            return async.series(configTasks, done)
          }
        })
      } else {
        return writeConfig('_config/', done)
      }
    },
    (responses, done) => {
      var response = responses.reduce(function (memo, response) {
        memo[response.path] = {
          ok: true,
          value: response.value
        }
        if (response.oldValue === response.value) {
          memo[response.path].unchanged = true
        }

        return memo
      }, {})
      return done(null, response)
    }
  ], callback)
}
