'use strict';

module.exports = function(DebugClient) {
  DebugClient.prototype.setbreakpoint = function (opts) {
    return (
      this._sendRequest('setbreakpoint', opts)
      .then(function(raw) {
        // TODO: parse breakpoint
        return raw.body;
      })
    );
  };
};
