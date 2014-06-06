'use strict';

var unmarshal = require('../types').unmarshal;

function unmarshalBreak(body) {
  return unmarshal({ body: body }, 'breakpoint');
}

module.exports = function(DebugClient) {
  DebugClient.prototype.listbreakpoints = function (opts) {
    return (
      this._sendRequest('listbreakpoints', opts)
      .then(function(raw) {
        return {
          breakpoints: raw.body.breakpoints.map(unmarshalBreak),
          breakOnExceptions: raw.body.breakOnExceptions,
          breakOnUncaughtExceptions: raw.body.breakOnUncaughtExceptions
        };
      })
    );
  };
};
