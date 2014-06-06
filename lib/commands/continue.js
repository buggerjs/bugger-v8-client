'use strict';

module.exports = function(DebugClient) {
  DebugClient.prototype.continue = function (opts) {
    return (
      this._sendRequest('continue', opts)
      .then(function() {
        // no response expected
      })
    );
  };
  DebugClient.prototype.resume = DebugClient.prototype.continue;

  DebugClient.prototype.stepInto = function(count) {
    return this['continue']({
      stepaction: 'in',
      stepcount: count
    });
  };

  DebugClient.prototype.stepOver = function(count) {
    return this['continue']({
      stepaction: 'next',
      stepcount: count
    });
  };

  DebugClient.prototype.stepOut = function(count) {
    return this['continue']({
      stepaction: 'out',
      stepcount: count
    });
  };
};
