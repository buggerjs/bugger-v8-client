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

function getFrameLocation(raw, reviver) {
  var script = reviver(raw.script, 'script');
  return {
    scriptId: script.scriptId,
    lineNumber: raw.line,
    columnNumber: raw.column
  };
}

function buildContextObject(rawFrame, context) {
  context.objectId =
    'scope-handle:' + rawFrame.index + ':0:' + rawFrame.receiver.handle;
  return context;
}

CallFrame.unmarshal = function(raw, reviver) {
  return new CallFrame(
    'frame:' + raw.index,
    getFunctionName(raw.func),
    getFrameLocation(raw, reviver),
    raw.scopes.map(function(scope) {
      scope.frameIndex = raw.index;
      return reviver(scope, 'scope');
    }),
    buildContextObject(raw, reviver(raw.receiver))
  );
};

module.exports = CallFrame;
