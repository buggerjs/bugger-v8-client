'use strict';

var scopeEnumToString = [
  'global', 'local', 'with', 'closure', 'catch'
];

function Scope(type, object) {
  this.type = type;
  this.object = object;
}

Scope.unmarshal = function(raw, reviver) {
  var type = scopeEnumToString[raw.type];
  var objectId = 'scope:' + raw.frameIndex + ':' + raw.index;
  var object = raw.object ? reviver(raw.object) : {};
  object.objectId = objectId;
  return new Scope(type, object);
};

module.exports = Scope;
