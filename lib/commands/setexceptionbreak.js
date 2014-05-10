'use strict';

function setexceptionbreak(opts) {
  if (typeof opts === 'undefined') {
    opts = { type: 'uncaught', enabled: true };
  }

  /*jshint validthis:true */
  return this._sendRequest('setexceptionbreak', opts);
}

setexceptionbreak.createResponse = function(raw) {
  return raw;
};

module.exports = setexceptionbreak;
