#### UMD template

`n` attempt to embrace all module system in one template.

#### Requirements
* supported for 'amd' AND 'global' AND 'cjs' when available

#### Draft
```js
(function (parent, factory){

  var _instance

  var hasAMD = typeof define === 'function' && define.amd
    , hasCJS = typeof exports === 'object'
    , hasWindow = typeof window != 'undefined'

  var amdDeps = []
    , globalDeps = []
    , cjsDeps = []

  var args = ['test-module-global', 'test-module-amd']
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

    //Possibility to remap globals i.e. lodash -> _ etc.
    if(parent[name] || window[name]) {
      globalDeps.push(name)
      deps[i] = parent[name] || window[name]
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
        define('umd-template', function() { 
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
      define('umd-template', function() { return _instance })
    }
  }

  function registerGlobal() {
    if(!amdDeps.length && hasWindow)
      parent["umd-template"] = _instance
  }

  function registerCJS() { 
    if (hasCJS && !amdDeps.length) 
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

  })(this, function (test_module_global,test_module_amd) {
    //MAGIC
  }
)
```
