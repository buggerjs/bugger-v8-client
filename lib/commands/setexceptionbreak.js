
module.exports = function setexceptionbreak(opts, cb) {
  if ('function' === typeof opts) {
    cb = opts;
    opts = null;
  }
  if (opts == null) {
    opts = { type: 'uncaught', enabled: true };
  }
  if ('function' !== typeof cb) cb = function(){}

  return this._sendRequest('setexceptionbreak', opts, function(err, raw, refMap) {
    if (err != null) return cb(err);
    return cb(null, raw);
  });
};
