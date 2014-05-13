'use strict';

var _ = require('lodash');

function _continue(opts) {
  // It's important that we don't send empty arguments
  if (_.isEmpty(opts)) {
    opts = void 0;
  }

  /*jshint validthis:true */
  return (
    this._sendRequest('continue', opts)
    .then(function() {
      // no response expected
    })
  );
}

module.exports = _continue;
