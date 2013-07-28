
var scopeEnumToString = [
  'global', 'local', 'with', 'closure', 'catch'
];

module.exports = function fromV8Scope(refMap, raw, target, fromV8Type) {
  target.type = scopeEnumToString[raw._type];
  target.object = { objectId: raw.handle };
  return target;
};
