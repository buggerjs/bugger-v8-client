'use strict';

function _continue(opts) {
  /*jshint validthis:true */
  return this._sendRequest('continue', opts);
}

_continue.createResponse = function() {
};

module.exports = _continue;
