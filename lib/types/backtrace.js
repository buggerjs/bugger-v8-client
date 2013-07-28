
module.exports = function fromV8Backtrace(refMap, raw, target, fromV8Type) {
  target.frames = raw.frames.map(function(frame) { return fromV8Type(frame); });
  return target;
};
