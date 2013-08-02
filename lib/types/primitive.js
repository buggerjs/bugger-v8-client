
module.exports = function fromV8Object(refMap, raw, target, fromV8Type) {
  target.type = raw.type;
  target.value = raw.value;
  target.description = raw.text;
  return target;
};
