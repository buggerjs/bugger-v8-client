
module.exports = function fromV8Frame(refMap, raw, target, fromV8Type) {
  target.callFrameId = 'frame:' + raw.index;

  var script = fromV8Type(raw.script);
  target.location = {
    scriptId: script.scriptId,
    lineNumber: raw.line,
    columnNumber: raw.column
  };

  target.scopeChain = raw.scopes.map(function(scope) {
    scope.handle = 'scope:' + raw.index + ':' + scope.index;
    scope.frameIndex = raw.index;
    scope._type = scope.type;
    scope.type = 'scope';
    return fromV8Type(scope);
  });

  target.functionName = raw.func.name || raw.func.inferredName || '<anonymous>';
  
  // the values of receiver seem strange (e.g. objectIds)
  target.this = fromV8Type(raw.receiver);

  return target;
};
