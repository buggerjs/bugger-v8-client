
var classNameToSubType = {
  Array: 'array',
  Date: 'date',
  RegExp: 'regexp'
};

module.exports = function fromV8Object(refMap, raw, target, fromV8Type) {
  target.type = 'object';
  target.subtype = classNameToSubType[raw.className];
  target.objectId = raw.handle;
  target.className = raw.className;
  target.description = raw.className;
  return target;
};
