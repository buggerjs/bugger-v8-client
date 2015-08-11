'use strict';

function FunctionMirror(objectId, name, inferredName) {
  this.type = 'function';
  this.objectId = objectId;
  this.name = name;
  this.inferredName = inferredName;
  this.description = inferredName || name;
}

Object.defineProperty(FunctionMirror.prototype, 'displayName', {
  get: function() {
    return this.inferredName || this.name;
  }
});

FunctionMirror.unmarshal = function(raw, reviver, scopePath) {
  if (scopePath === '?:?') {
    throw new Error('Needs scopePath');
  }
  return new FunctionMirror(
    'scope-handle:' + scopePath + ':' + raw.handle,
    raw.name,
    raw.inferredName
  );
};

module.exports = FunctionMirror;
