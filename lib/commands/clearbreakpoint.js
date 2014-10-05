'use strict';

var unmarshal = require('../types').unmarshal;
var UrlMapper = require('../types/script').UrlMapper;

module.exports = function(DebugClient) {
  DebugClient.prototype.removeBreakpoint =
  function removeBreakpoint(breakpointId) {
    return this._sendRequest('clearbreakpoint', {
      breakpoint: parseInt(''+breakpointId, 10)
    });
  };
};
