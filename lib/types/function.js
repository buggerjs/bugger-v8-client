
module.exports = function fromV8Function(refMap, raw, target, fromV8Type) {
  target.objectId = raw.handle;
  return target;
};
