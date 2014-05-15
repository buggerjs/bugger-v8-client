'use strict';

// var Frame = require('./frame');

var ScopeType = {
  Global: 0,
  Local: 1,
  With: 2,
  Closure: 3,
  Catch: 4,
  Block: 5
};

function Scope(frameIdx, idx, type) {
  this.frameIndex = frameIdx;
  this.index = idx;
  this.type = type;
  this.hasDetails = false;
}
Scope.Type = ScopeType;

Object.defineProperty(Scope.prototype, 'objectId', {
  get: function() {
    return 'scope:' + this.frameIndex + ':' + this.index;
  }
});

function FramePosition(script, line, column, charIdx, text) {
  this.script = script;
  this.line = +line;
  this.column = +column;
  this.position = +charIdx;
  this.sourceLineText = text;
}

function Frame(index, position, scopes, func) {
  this.index = index;
  this.position = position;
  this.scopes = scopes;
  this.func = func;
}

Frame.unmarshal = function(raw, reviver) {
  var pos = new FramePosition(
    reviver(raw.script, 'script'),
    raw.line,
    raw.column,
    raw.position,
    raw.sourceLineText
  );
  return new Frame(
    raw.index,
    pos,
    raw.scopes.map(function(typeIndex) {
      return new Scope(raw.index, typeIndex.index, typeIndex.type);
    }),
    reviver(raw.func)
  );
};

function Backtrace(frames, from, to, total) {
  this.frames = frames;
  this.fromFrame = from;
  this.toFrame = total;
  this.totalFrames = total;
}

Backtrace.unmarshal = function(raw, reviver) {
  var frames = raw.frames.map(function(rawFrame) {
    return Frame.unmarshal(rawFrame, reviver);
  });
  return new Backtrace(
    frames,
    raw.fromFrame,
    raw.toFrame,
    raw.totalFrames
  );
};

module.exports = Backtrace;
