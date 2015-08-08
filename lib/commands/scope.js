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
    if (!global.__bugger__) {
      Object.defineProperty(global, '__bugger__', { value: {} });
    }
    global.__bugger__.NativeModule = NativeModule;
  }

  DebugClient.prototype.storeNativeModule =
  function storeNativeModule() {
    var self = this;
    return this._sendRequest('evaluate', {
        global: true,
        expression: fnWithNativeModuleInScope
      })
      .then(function(remoteObject) {
        var functionHandle = remoteObject.body.handle;
        return self._sendRequest('scope', {
          functionHandle: remoteObject.body.handle
        });
      })
      .then(function(result) {
        var props = result.refs[0].properties;
        var NM = _.find(props, { name: 'NativeModule' });
        if (!NM) {
          throw new Error('Cannot find NativeModule in scope');
        }
        return self._sendRequest('evaluate', {
          global: true,
          expression: '(' + storeOnMagicalBuggerContext.toString() + ')(NM)',
          additional_context: [
            { name: 'NM', handle: NM.ref }
          ]
        });
      })
      .then(function() {});
  };
};
