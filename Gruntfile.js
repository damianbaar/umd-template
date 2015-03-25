module.exports = function(grunt) {

  grunt.registerTask('test', [])
  grunt.registerTask('example', ['redefine'])
  grunt.registerTask('default', ['redefine'])

  grunt.initConfig({
    redefine: {
      options: { 
        wrappers: { 
          'umd-template': require('./index')
        }
      , wrapper: 'umd-template'
      , globals : {
          'test-module-global': 'custom.namespace["test-module"]'
        }
      , development: false
      },

      "umd-async": {
          src: ['./umd-async.js']
        , names: { amd: 'umd-async', global: 'umd.async' }
        , cwd: './example'
        , dest : './example/umd-async.bundle.js'
      },

      "umd-sync": {
          src: ['./umd-sync.js']
        , names: { amd: 'umd-sync', global: 'umd.sync' }
        , cwd: './example'
        , dest : './example/umd-sync.bundle.js'
      }
    }
  })

  grunt.loadNpmTasks('grunt-re-define')
}
