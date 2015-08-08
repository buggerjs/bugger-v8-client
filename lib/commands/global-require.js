'use strict';

var _ = require('lodash');
var Bluebird = require('bluebird');

var fnWithNativeModuleInScope =
  'Object.getOwnPropertyDescriptor(global, "console").get';

function storeOnMagicalBuggerContext(NativeModule) {
  if (global.__bugger__ &&
      typeof global.__bugger__.require === 'function' &&
      typeof global.__bugger__.Module === 'function') {
    return true;
  }

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
  var wasRunning;

  return debugClient._sendRequest('version')
    .then(function() {
      wasRunning = debugClient.running;
      if (wasRunning) {
        return debugClient.suspend();
      }
    })
    .then(function() {
      return debugClient._sendRequest('evaluate', {
        global: true,
        expression: fnWithNativeModuleInScope
      });
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
    .then(function(result) {
      if (result.success !== true || result.body.value !== true) {
        throw new Error('Failed to acquire require');
      }
      return true;
    })
    .finally(function() {
      if (wasRunning) return debugClient.resume();
    });
}

module.exports = function(DebugClient) {
  DebugClient.prototype.prepareGlobalRequire =
  function prepareGlobalRequire() {
    var debugClient = this;
    return debugClient.evalSimple(storeOnMagicalBuggerContext)
      .then(function(result) {
        if (result !== true) {
          return storeUsingFunctionScope(debugClient);
        }
        return result;
      });
  };
};
