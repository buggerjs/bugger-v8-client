'use strict';

var unmarshal = require('../types').unmarshal;
var UrlMapper = require('../types/script').UrlMapper;

module.exports = function(DebugClient) {
  DebugClient.prototype.setBreakpointByUrl =
  function setBreakpointByUrl(url, line, column, condition) {
    return this.setbreakpoint({
      type: 'script',
      target: UrlMapper.scriptNameFromUrl(url),
      line: line,
      column: column,
      condition: condition
    });
  };

  DebugClient.prototype.setbreakpoint =
  function setbreakpoint(opts) {
    return this._sendRequest('setbreakpoint', opts)
      .then(function(raw) {
        return unmarshal(raw, 'breakpoint');
      });
  };
};
