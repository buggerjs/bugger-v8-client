'use strict';

function _continue(opts) {
  /*jshint validthis:true */
  return (
    this._sendRequest('continue', opts)
    .then(function() {
      // no response expected
    })
  );
}

module.exports = _continue;
