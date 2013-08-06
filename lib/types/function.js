
module.exports = function fromV8Function(refMap, raw, target, fromV8Type) {
  target.type = 'function'
  target.objectId = raw.handle;
  target.description = raw.text || raw.name || raw.inferredName;
  return target;
};
