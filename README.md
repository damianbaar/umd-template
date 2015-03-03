#### UMD template

`n` attempt to embrace all module system in one template.

#### Requirements
* support for `amd` AND `global` AND `cjs` when available 
* handling async nature of `requirejs`
* do not register any global when dealing with `node`
* resolve dependency based upon one system scope, if global take global, if amd take am...

#### Caveats (some obvious facts)
* if lib is not registered within global then lib is assumed that most likely it is a `async` dep and `requirejs` loader is required.

#### Examples
Check how it works with [globals](examples/index.global.html) or with [requirejs](examples/index.require.html)

#### Template
```js
//externals: test-module-global,test-module-amd
(function (parent, factory){
  var _instance

  var hasAMD = typeof define === 'function' && define.amd
    , hasCJS = typeof exports === 'object'
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
      //Available for remapping on build step lodash -> _ etc.

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
    if (hasAMD && amdDeps.length) {
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
    } else {
      define('umd-async', function() { return _instance })
    }
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
)
```
