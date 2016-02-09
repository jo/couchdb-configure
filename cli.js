#!/usr/bin/env node

var configure = require('./')

var args = process.argv.slice(2)
if (!args.length) {
  console.log('Usage: \ncouchdb-configure URL [SOURCE]')
  process.exit()
}

var url = args[0]
var source = args[1] || process.cwd()

configure(url, source, function (error, response) {
  if (error) return console.error(error)

  console.log(JSON.stringify(response, null, '  '))
})
