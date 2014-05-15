'use strict';

module.exports = function(DebugClient) {
  DebugClient.prototype.listbreakpoints = function (opts) {
    return (
      this._sendRequest('listbreakpoints', opts)
      .then(function(raw) {
        // TODO: parse breakpoint
        return raw.body;
      })
    );
  };
};
