
module.exports = function setexceptionbreak(state, cb) {
  if ('function' === typeof state) {
    cb = state;
    state = null;
  }
  if (state == null) state = 'uncaught';
  if ('function' !== typeof cb) cb = function(){}

  var optArr = [
    { type: 'all', enabled: state === 'all' },
    { type: 'uncaught', enabled: state === 'uncaught' }
  ];

  var results = {};
  var waitFor = optArr.length;
  var errors = [];
  var _self = this;

  return optArr.forEach(function(opts) {
    return _self._sendRequest('setexceptionbreak', opts, function(err, raw, refMap) {
      if (err != null) {
        errors.push(err);
      } else {
        results[raw.type] = raw.enabled;
      }
      var newState = results.all ? 'all' : (results.uncaught ? 'uncaught' : 'none');
      if (--waitFor === 0) return cb(errors.pop(), newState);
    });
  });
};
