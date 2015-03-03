//re-define version:0.0.1-alpha
//externals: test-module-global
(function (parent, factory){
  var _instance

  var hasAMD = typeof define === 'function' && define.amd
    , hasCJS = typeof module === 'object' || typeof exports === 'object'
    , hasWindow = typeof window != 'undefined'

  var amdDeps = []
    , globalDeps = []
    , cjsDeps = []

  var args = ['test-module-global']
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
      define('umd-sync', function() { return _instance })
      return
    }

    //Load missing dependencies
    require(amdDeps, function() {
      var asyncDeps = arguments
        , current = 0

      //After all dependencies are loaded - register a module
      define('umd-sync', function() { 
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
    parent["umd"]["sync"] = _instance;

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
  }(this, function (test_module_global) {
  var closure = {}
  closure['test-module-global'] = test_module_global
  
var __req = (function (modules, namespace, imports) {
  var __oldReq = typeof require == "function" && require

  function __req(name){

    if(!namespace[name]) {
      var f = modules[name]
        , m = { exports:{} }
        , args

      if(f) {

        args = [m.exports, function(x) {
          return __req(x)
        }, m].concat(f.slice(1))

        namespace[name] = m
        f = f[0].apply(null, args)
      } else {
        var mod
          , len = imports && imports.length;

        for(var i=0; i < len; i++) {
          mod = imports[i] && imports[i][name];
          if(mod) return mod;
        }

        if(__oldReq) return __oldReq.apply(null, arguments);
        throw new Error('Module does not exists ' + name);
      }
    }
    return namespace[name].exports;
  }

  return __req;
})
({ 
'umd-sync/umd-sync': [function(exports,require,module) { 
    var global = require('test-module-global');
    module.exports = 'umd-sync::ready::all deps lodaded';
}]
}
, {} 
, typeof window === 'undefined' ? [] : [closure]
)

return __req('umd-sync/umd-sync')

}.bind({})))
