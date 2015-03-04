#### UMD template

`n` attempt to embrace all module system in one template.

#### Requirements
* support for `amd` AND `global` AND `cjs` when available 
* handling async nature of `requirejs`
* do not register any global when dealing with `node`
* resolve dependency based upon one system scope, if global take global, if amd take am...

#### Caveats (some obvious facts)
* module not available via `UMD` (`AMD`or`global`or`CJS`) - if dependency is not registered within global scope then will be treated as `async` dependency and `requirejs` loader will be required, it is only applicable when `requirejs` exists, otherwise will try to run other `require` or just fail because of missing dependency.

#### Examples
Check how it deals with [globals](http://damianbaar.github.io/umd-template/index.global.html); [requirejs](http://damianbaar.github.io/umd-template/index.require.html); [cjs](http://damianbaar.github.io/umd-template/index.cjs.html)

Template in action [A](example/umd-sync.bundle.js), [B](example/umd-async.bundle.js)

#### Grunt with `re-define`

```js
  grunt.initConfig({
    redefine: {
      options: { 
        wrappers: { 
          'umd-template': require('re-define-umd-template')
        }
      , wrapper: 'umd-template'
  ....
```

##### ... for lazy ones
```js
//externals: test-module-global,test-module-amd
(function (parent, factory){
  var _instance

  var hasAMD = typeof define === 'function' && define.amd
    , hasCJS = typeof module === 'object' || typeof exports === 'object'
    , hasWindow = typeof window != 'undefined'

  var amdDeps = []
    , globalDeps = []
    , cjsDeps = []

  var args = ['test-module-global','test-module-amd']
    , deps = []
  
  //Only for node
  if(!hasWindow) {
    cjsDeps = args
    initFactory()
    registerCJS()
    return
  }

  //Check dependency availability whether is registered as amd,global or cjs
  for(var i = 0; i < args.length; i++) {
    var name = args[i]
    , globals = {"test-module-global":"test-module"}
    , _name = globals[name] || name

    if(parent[_name] || window[_name]) {
      globalDeps.push(_name)

      deps[i] = parent[_name] || window[_name]
      continue
    }

    if(!hasAMD && require) {
      cjsDeps.push(name)
      deps[i] = require(name)
      continue
    }

    if(!hasAMD) throw new Error('Module does not exists within any known module system ' + name)

    amdDeps.push(name)
  }
  
  initFactory()
  registerAMD()
  registerCJS()
  registerGlobal()

  function registerAMD() {
    if (!hasAMD) return

    if (!amdDeps.length) {
      define('umd-async', function() { return _instance })
      return
    }

    //Load missing dependencies
    require(amdDeps, function() {
      var asyncDeps = arguments
        , current = 0

      //After all dependencies are loaded - register a module
      define('umd-async', function() { 
        //Fill missing dependencies with right async instances
        //[dep,undefined,dep,undefined] -> [dep, arguments[0], dep, arguments[1]]
        for(var i = 0; i < args.length; i++) {
          if(typeof deps[i] == 'undefined') {
            deps[i] = asyncDeps[current]
            current++
          }
        }

        amdDeps = []

        initFactory()
        registerGlobal()
        registerCJS()

        return _instance
      })
    })
  }

  function registerGlobal() {
    if(!amdDeps.length && hasWindow) {
    parent["umd"] = parent["umd"] || {};
    parent["umd"]["async"] = _instance;

    }
  }

  function registerCJS() { 
    if (!amdDeps.length && hasCJS)
      module.exports = _instance 
  }

  function initFactory() { 

    isReady() && (_instance = factory.apply(null, deps))

    function isReady() {
      var ready = true
      for(var i = 0; i < args.length; i++) {
        if(!ready) break
        ready = typeof deps[i] != 'undefined'
      }
      return ready
    }
  }
}(this, function (test_module_global,test_module_amd) {
    //MAGIC, your spels!
})
```
