var nano = require('nano')
var async = require('async')
var compile = require('couchdb-compile')

module.exports = function configure(url, source, callback) {
  var couch = nano(url)

  compile(source, function(error, config) {
    var settings = Object.keys(config)
      .reduce(function(memo, key) {
        if (typeof config[key] !== 'object') return memo

        var section = Object.keys(config[key])
          .map(function(k) {
            return {
              path: encodeURIComponent(key) + '/' + encodeURIComponent(k),
              value: config[key][k]
            }
          })

        return memo.concat(section)
      }, [])

    async.map(settings, function(setting, next) {
      couch.request({
        method: 'PUT',
        path: '_config/' + setting.path,
        body: setting.value
      }, next)
    }, callback)
  })
}
