'use strict';

var unmarshal = require('../types').unmarshal;

module.exports = function(DebugClient) {
  DebugClient.prototype.setbreakpoint = function (opts) {
    return (
      this._sendRequest('setbreakpoint', opts)
      .then(function(raw) {
        return unmarshal(raw, 'breakpoint');
      })
    );
  };
};
