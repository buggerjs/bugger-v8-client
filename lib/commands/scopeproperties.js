
var fromV8Type = require('../types').fromV8Type;

module.exports = function scopeproperties(scopeId, cb) {
  var opts = { inlineRefs: true }, _self = this;
  (function($parts) {
    opts.number = parseInt($parts.pop(), 10);
    opts.frameNumber = parseInt($parts.pop(), 10);
  })(scopeId.split(':'));

  return this._sendRequest('scope', opts, function(err, rawScope, refMapScope) {
    if (err != null) return cb(err);
    var ids = rawScope.object.properties.map(function(prop) {
      return prop.value.ref;
    });
    _self._sendRequest('lookup', { handles: ids }, function(err, idToRaw, refMap) {
      var properties = rawScope.object.properties.map(function(prop) {
        return {
          name: prop.name,
          value: fromV8Type(idToRaw[prop.value.ref], refMap)
        }
      });
      return cb(null, properties);
    });
  });
};
