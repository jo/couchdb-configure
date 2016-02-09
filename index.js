var nanoOption = require('nano-option')
var async = require('async')
var compile = require('couchdb-compile')
var assert = require('assert')

module.exports = function configure (url, source, callback) {
  var couch = nanoOption(url)

  assert(typeof couch.request === 'function',
    'URL must point to the root of a CouchDB server (not to a database).')

  compile(source, { index: true }, function (error, config) {
    if (error) {
      return callback(error)
    }

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

    async.map(settings, function (setting, next) {
      couch.request({
        method: 'PUT',
        path: '_config/' + setting.path,
        body: setting.value
      }, function (error, oldValue) {
        if (error) return next(error)

        next(null, {
          path: setting.path,
          value: setting.value,
          oldValue: oldValue
        })
      })
    }, function (error, responses) {
      if (error) return callback(error)

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

      callback(null, response)
    })
  })
}
