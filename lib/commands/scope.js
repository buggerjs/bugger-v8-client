'use strict';

var _ = require('lodash');

module.exports = function(DebugClient) {
  DebugClient.prototype.getFunctionScope =
  function getFunctionScope(functionHandle, number) {
    var opts = { functionHandle: functionHandle };
    if (typeof number === 'number') {
      opts.number = number;
    }
    return this._sendRequest('scope', opts)
      .then(function(raw) { return raw.refs[0].properties; });
  };

  var fnWithNativeModuleInScope =
    'Object.getOwnPropertyDescriptor(global, "console").get';

  function storeOnMagicalBuggerContext(NativeModule) {
    var Module;
    if (!NativeModule) {
      if (typeof process === 'undefined' || process.mainModule === undefined) {
        return false;
      }
      Module = process.mainModule.require('module');
    } else {
      Module = NativeModule.require('module');
    }

    if (!global.__bugger__) {
      Object.defineProperty(global, '__bugger__', { value: {} });
    }
    global.__bugger__.Module = Module;
    global.__bugger__.require = Module._load;

    return true;
  }

  function storeUsingFunctionScope(debugClient) {
    return debugClient._sendRequest('evaluate', {
        global: true,
        expression: fnWithNativeModuleInScope
      })
      .then(function(remoteObject) {
        var functionHandle = remoteObject.body.handle;
        return debugClient._sendRequest('scope', {
          functionHandle: functionHandle
        });
      })
      .then(function(result) {
        var props = result.refs[0].properties;
        var NM = _.find(props, { name: 'NativeModule' });
        if (!NM) {
          throw new Error('Cannot find NativeModule in scope');
        }
        return debugClient._sendRequest('evaluate', {
          global: true,
          expression: '(' + storeOnMagicalBuggerContext.toString() + ')(NM)',
          additional_context: [
            { name: 'NM', handle: NM.ref }
          ]
        });
      })
      .then(function() { return true; });
  }

  DebugClient.prototype.storeNativeModule =
  function storeNativeModule() {
    var debugClient = this;

    return debugClient.evalSimple(storeOnMagicalBuggerContext)
      .catch(function(err) {
        return storeUsingFunctionScope(debugClient);
      });
  };
};
