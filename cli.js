#!/usr/bin/env node

var configure = require('./')


var url = process.argv[2]
var source = process.argv[3]


configure(url, source, function(error, response) {
  if (error) return console.error(error)

  console.log(JSON.stringify(response, null, '  '))
})
