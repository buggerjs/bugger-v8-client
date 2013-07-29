
var fromV8Type = require('../types').fromV8Type;

module.exports = function backtrace(opts, cb) {
  if ('function' === typeof opts) {
    cb = opts;
    opts = {};
  }
  if (opts.inlineRefs == null) opts.inlineRefs = true;
  if ('function' !== typeof cb) cb = function(){}

  return this._sendRequest('backtrace', opts, function(err, raw, refMap) {
    if (err != null) return cb(err);
    return cb(null, fromV8Type(raw, refMap, 'backtrace'));
  });
};
