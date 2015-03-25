#### UMD template

`n` attempt to embrace all module system in one template.

#### Requirements
* support for `amd` AND `global` AND `cjs` when available 
* handling async nature of `requirejs`
* do not register any global when dealing with `node`
* resolve dependency based upon one system scope, if global take global, if amd take am...

#### Caveats (some obvious facts)
* module not available via `global`or`CJS` - when you requires a module which only is reachable from `requirejs` then you need to require your main in `requirejs` manner in order to keep order in async libs.

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

#### Template

#### with `async` support

```
(function (parent, factory){
  var _instance

  //PARAMS
  var externals = ['jquery', 'lodash']
    , globals = { jquery: $, lodash: _ }
    , exports = { amd: 'MODULE-A', global: 'MODULE-A' }
    , registerGlobal = function() {
        /**
         * a.b.c => var a = a || {}; a.b = a.b || {}; a.b.c = _instance
         **/
        parent[ exports.global ] = _instance
    }

  var hasAMD = typeof define === 'function' && define.amd
    , hasCJS = typeof module === 'object' || typeof exports === 'object'
    , hasWindow = typeof window != 'undefined'
    , hasRequire = typeof require == 'function'

  var amdDeps = []
    , globalDeps = []
    , cjsDeps = []
    , deps = []

  //Only for node
  if(!hasWindow) {
    cjsDeps = exports
    initFactory()
    registerCJS()
    return
  }

  //Check dependency availability whether is registered as amd,global or cjs
  for(var i = 0; i < exports.length; i++) {
    var name = exports[i]
      , _name = globals[name] || name
      , dep 

    if(dep = (_find(parent, _name) || _find(window, _name))) {
      globalDeps.push(_name)

      deps[i] = dep
      continue
    }

    if(!hasAMD && hasRequire) {
      cjsDeps.push(name)
      deps[i] = require(name)
      continue
    }

    if(!hasAMD) throw new Error('Module does not exists within any known module system ' + name)

    amdDeps.push(name)
  }
  
  _initFactory()
  _registerAMD()
  _registerCJS()
  _registerGlobal()

  function _registerAMD() {
    if (!hasAMD) return

    if (!amdDeps.length) {
      define(exports.amd, function() { return _instance })
      return
    }

    //Load missing dependencies
    require(amdDeps, function() {
      var asyncDeps = arguments
        , current = 0

      //After all dependencies are loaded - register a module
      define(exports.amd, function() { 
        //Fill missing dependencies with right async instances
        //[dep, undefined, dep, undefined] -> [dep, arguments[0], dep, arguments[1]]
        for(var i = 0; i < exports.length; i++) {
          if(typeof deps[i] == 'undefined') {
            deps[i] = asyncDeps[current]
            current++
          }
        }

        amdDeps = []

        _initFactory()
        _registerGlobal()
        _registerCJS()

        return _instance
      })
    })
  }

  function _registerCJS() { 
    if (!amdDeps.length && hasCJS)
      module.exports = _instance 
  }
  
  //resolving long dots path, like window.foo.baz['bar']
  function _find(parent, path) {
    var _d, _p, k;
    _p = path.match(/([\w|\-\_]+)/g)
    for(k = 0; k < _p.length; k++) { 
      if(k == 0) { _d = parent[_p[k]] }
      else { _d && (_d = _d[_p[k]]) }
    }
    return _d
  }

  function _registerGlobal() {
    if(!amdDeps.length && hasWindow) 
      _registerGlobal && _registerGlobal()
  }

  function _initFactory() { 

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
  })(this, function (jquery, lodash) {
  
  return EXPORT_YOUR_SPELLS
})
```

##### sync only

* register: `amd` OR `global' or `cjs`
* when exporting `global` or `cjs` then all dependencies needs to be available in `global` scope or via `requirejs`, `amd` deps are omitted completely here.

```
(function (parent, factory){
  var __f

  if (typeof exports === 'object')
    module.exports = __f = factory(require('jquery'), require('lodash'))

  if (typeof window != 'undefined') {
    var hasAMD = typeof define === 'function' && define.amd

    __f = __f || factory(this.$, this._) 
    parent["MODULE-A"] = __f

    if (hasAMD) define('MODULE-A', function() { return __f })
  }
  })(this, function (jquery, lodash) {

  return EXPORT_YOUR_SPELLS

})
```
