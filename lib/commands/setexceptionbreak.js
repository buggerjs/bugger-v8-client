'use strict';

function getBody(raw) {
  return raw.body;
}

function setexceptionbreak(opts) {
  if (typeof opts === 'undefined') {
    opts = { type: 'uncaught', enabled: true };
  }

  /*jshint validthis:true */
  return (
    this._sendRequest('setexceptionbreak', opts)
    .then(getBody)
  );
}

module.exports = setexceptionbreak;
