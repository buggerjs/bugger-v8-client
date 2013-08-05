
module.exports = function pause(cb) {
  return this._sendRequest('suspend', {}, function(err) {
    console.log(arguments);
    if (err != null) return cb(err);
    return cb();
  });
};
