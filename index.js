var path = require('path')
  , fs = require('fs')

module.exports = fs.readFileSync(path.resolve(__dirname, './umd.tmpl'))
