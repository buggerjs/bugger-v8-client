
module.exports = function clearbreakpoint(breakpointId, cb) {
  if ('function' !== typeof cb) cb = function(){}

  var opts = { breakpoint: breakpointId };

  return this._sendRequest('clearbreakpoint', opts, function(err, raw) {
    if (err != null) return cb(err);
    return cb(null, { breakpointId: raw.breakpoint.toString() });
  });
};
