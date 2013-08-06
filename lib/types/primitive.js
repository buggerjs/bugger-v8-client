
module.exports = function fromV8Object(refMap, raw, target, fromV8Type) {
  if (raw.type === 'null') {
    target.type = 'object';
    target.subtype = 'null';
  } else {
    target.type = raw.type;
  }
  target.value = raw.value;
  target.description = raw.text;
  return target;
};
