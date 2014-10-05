'use strict';

function FunctionMirror(name, inferredName) {
  this.type = 'function';
  this.name = name;
  this.inferredName = inferredName;
  this.description = inferredName || name;
}

Object.defineProperty(FunctionMirror.prototype, 'displayName', {
  get: function() {
    return this.inferredName || this.name;
  }
});

FunctionMirror.unmarshal = function(raw) {
  // console.log('FunctionMirror', raw);
  return new FunctionMirror(raw.name, raw.inferredName);
};

module.exports = FunctionMirror;
