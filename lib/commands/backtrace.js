'use strict';

var unmarshal = require('../types').unmarshal;

module.exports = function(DebugClient) {
  DebugClient.prototype.backtrace = function (opts) {
    if (typeof opts === 'undefined')
      opts = {};
    if (typeof opts.inlineRefs === 'undefined')
      opts.inlineRefs = true;

    /*jshint validthis:true */
    return (
      this._sendRequest('backtrace', opts)
      .then(unmarshal)
    );
  };
};
