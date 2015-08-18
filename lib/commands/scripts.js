'use strict';

var unmarshal = require('../types').unmarshal;

function unmarshalScript(body) {
  return unmarshal({ body: body }, 'script');
}

function unmarshalScripts(raw) {
  return raw.body.map(unmarshalScript);
}

module.exports = function(DebugClient) {
  DebugClient.prototype._getScripts = function(opts) {
    return this._sendRequest('scripts', opts)
      .then(unmarshalScripts);
  }

  DebugClient.prototype.getScripts = function(ids) {
    var opts = { includeSource: true, ids: ids };
    return this._getScripts({ includeSource: false, ids: ids });
  };

  DebugClient.prototype.getScriptsWithSource = function(ids) {
    var opts = { includeSource: true, ids: ids };
    return this._getScripts({ includeSource: true, ids: ids });
  };
};
