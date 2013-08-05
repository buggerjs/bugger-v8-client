
module.exports = function resume(opts, cb) {
  if ('function' === typeof opts) {
    cb = opts;
    opts = null;
  }
  if ('function' !== typeof cb) cb = function(){}

  if ('string' === typeof opts) {
    opts = { stepaction: opts };
  }

  return this._sendRequest('continue', opts, function(err, raw, refMap) {
    if (err != null) return cb(err);
    return cb();
  });
};
