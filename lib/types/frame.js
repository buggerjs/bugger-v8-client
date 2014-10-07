'use strict';

function CallFrame(callFrameId, functionName, location, scopeChain, context) {
  this.callFrameId = callFrameId;
  this.functionName = functionName;
  this.location = location;
  this.scopeChain = scopeChain;
  this['this'] = context;
}

function getFunctionName(func) {
  if (!func) return 'unknown';
  return func.name || func.inferredName || '(anonymous function)';
}

function getFrameLocation(raw, reviver, scopePath) {
  var script = reviver(raw.script, 'script', scopePath);
  return {
    scriptId: script.scriptId,
    lineNumber: raw.line,
    columnNumber: raw.column
  };
}

CallFrame.unmarshal = function(raw, reviver) {
  var scopePath = '' + raw.index + ':0';
  return new CallFrame(
    'frame:' + raw.index,
    getFunctionName(raw.func),
    getFrameLocation(raw, reviver, scopePath),
    raw.scopes.map(function(scope) {
      scope.frameIndex = raw.index;
      return reviver(scope, 'scope', scopePath);
    }),
    reviver(raw.receiver, null, scopePath)
  );
};

module.exports = CallFrame;
