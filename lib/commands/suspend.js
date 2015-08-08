'use strict';

var _ = require('lodash');

module.exports = function(DebugClient) {
  DebugClient.prototype.suspend =
  function suspend() {
    return this._sendRequest('suspend').then(_.noop);
  };

  DebugClient.prototype.pause = DebugClient.prototype.suspend;

  DebugClient.prototype.waitForPaused =
  function waitForPaused() {
    var debugClient = this, wasRunning;
    return debugClient._sendRequest('version')
      .then(function() {
        wasRunning = debugClient.running;
        if (wasRunning === true) {
          return debugClient.nextEvent('paused');
        }
      })
      .then(function() { return wasRunning; });
  }
};
