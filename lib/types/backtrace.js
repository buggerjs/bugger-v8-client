
module.exports = function fromV8Backtrace(refMap, raw, target, fromV8Type) {
  if (Array.isArray(raw.frames))
    target.callFrames = raw.frames.map(function(frame) { return fromV8Type(frame); });
  else
    target.callFrames = [];
  return target;
};
