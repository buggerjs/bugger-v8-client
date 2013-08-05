
var fromV8Type = require('../types').fromV8Type;

module.exports = function scripts(ids, cb) {
  var opts = {
    includeSource: true,
    types: 4
  };

  if ('function' === typeof ids) {
    cb = ids;
    ids = null;
  } else if(Array.isArray(ids)) {
    opts.ids = ids.map(function(id) { return parseInt(id, 10); });
  }
  if ('function' !== typeof cb) cb = function(){}

  return this._sendRequest('scripts', opts, function(err, raws, refMap) {
    if (err != null) return cb(err);
    var sources = {};
    var scripts = raws.map(function(raw) {
      sources[raw.id.toString()] = raw.source;
      return fromV8Type(raw, refMap);
    });
    return cb(null, scripts, sources);
  });
};
