
var fromV8Type = require('../types').fromV8Type;
var async = require('async');

module.exports = function backtrace(opts, cb) {
  var _self = this;

  if ('function' === typeof opts) {
    cb = opts;
    opts = {};
  }
  if (opts.inlineRefs == null) opts.inlineRefs = true;
  if ('function' !== typeof cb) cb = function(){}

  return this._sendRequest('backtrace', opts, function(err, raw, refMap) {
    if (err != null) return cb(err);
    var frameIndices = (raw.frames || []).map(function(frame) {
      return frame.index;
    });

    async.forEach(frameIndices, function(frame, scopesLoaded) {
      _self._sendRequest('scopes', { frameNumber: frame }, function(err, rawScopes, scopesRefMap) {
        rawScopes.scopes.forEach(function(rawScope) {
          var scopeHandle = 'scope:' + rawScope.frameIndex + ':' + rawScope.index;
          rawScope._type = rawScope.type;
          rawScope.handle = scopeHandle;
          refMap[scopeHandle] = fromV8Type(rawScope, scopesRefMap, 'scope');
        });
        return scopesLoaded();
      });
    }, function(err) {
      return cb(null, fromV8Type(raw, refMap, 'backtrace'));
    });
  });
};
