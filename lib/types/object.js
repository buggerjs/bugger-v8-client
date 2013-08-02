
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

  if (Array.isArray(raw.properties)) {
    if (target.subtype === 'array') {
      target.description += '[' + (raw.properties.length - 1) + ']';
    }
    target.properties = raw.properties.map(function(v8Prop) {
      var type = v8Prop.propertyType;
      var attrCount = v8Prop.attributes;
      var name = v8Prop.name;
      var value = fromV8Type(v8Prop);
      return {
        name: v8Prop.name,
        value: value
      };
    });
  }

  return target;
};
