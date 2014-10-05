'use strict';

var unmarshal = require('../types').unmarshal;

function unmarshalScript(body) {
  return unmarshal({ body: body }, 'script');
}

module.exports = function(DebugClient) {
  DebugClient.prototype.getScriptsWithSource = function() {
    var opts = { includeSource: true };
    return (
      this._sendRequest('scripts', opts)
      .then(function(raw) {
        return raw.body.map(unmarshalScript);
      })
    );
  };
};
