
var scopeEnumToString = [
  'global', 'local', 'with', 'closure', 'catch'
];

module.exports = function fromV8Scope(refMap, raw, target, fromV8Type) {
  if (refMap[raw.handle] != null && refMap[raw.handle].type != null) {
    return refMap[raw.handle];
  }
  target.type = scopeEnumToString[raw._type];
  target.frameIndex = raw.frameIndex;
  target.object = raw.object != null ?
    fromV8Type(raw.object) : {}
  target.object.objectId = raw.handle;
  return target;
};
