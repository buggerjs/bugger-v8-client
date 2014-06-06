'use strict';

function getBody(raw) {
  return raw.body;
}

module.exports = function(DebugClient) {
  DebugClient.prototype.setexceptionbreak = function (opts) {
    if (typeof opts === 'undefined') {
      opts = { type: 'uncaught', enabled: true };
    }

    /*jshint validthis:true */
    return (
      this._sendRequest('setexceptionbreak', opts)
      .then(getBody)
    );
  };
};
