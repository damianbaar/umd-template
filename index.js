var global = require('test-module-global')
  , amd = require('test-module-amd')

console.log('global dependency:', global)
console.log('amd dependency:', amd)

module.exports = 'index'
