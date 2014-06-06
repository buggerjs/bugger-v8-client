'use strict';

function FunctionMirror(name, inferredName) {
  this.name = name;
  this.inferredName = inferredName;
}

Object.defineProperty(FunctionMirror.prototype, 'displayName', {
  get: function() {
    return this.inferredName || this.name;
  }
});

FunctionMirror.unmarshal = function(raw) {
  return new FunctionMirror(raw.name, raw.inferredName);
};

module.exports = FunctionMirror;

// module.exports = function fromV8Function(refMap, raw, target, fromV8Type) {
//   target.objectId = raw.handle;
//   return target;
// };
