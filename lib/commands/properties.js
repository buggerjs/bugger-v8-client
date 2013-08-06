
var fromV8Type = require('../types').fromV8Type;

module.exports = function properties(objectId, ownProperties, cb) {
  var internalId = parseInt(objectId, 10),
      opts = { handles: [internalId] },
      _self = this;

  return this._sendRequest('lookup', opts, function(err, raw, refMap) {
    if (err != null) return cb(err);
    var rawProps = raw[internalId].properties;
    var properties = rawProps.map(function(prop) {
      return {
        name: prop.name.toString(),
        value: fromV8Type(prop, refMap),
        enumerable: prop.propertyType !== 3
      };
    });
    return cb(null, properties);
  });
};
