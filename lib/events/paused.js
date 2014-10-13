'use strict';

var util = require('util');

var DebuggerEvent = require('./base');

function PausedEvent(original, callFrames) {
  if (!this instanceof PausedEvent)
    return new PausedEvent(original, callFrames);

  DebuggerEvent.call(this, 'paused');

  original = original || {};

  this.callFrames = callFrames;
  this.reason = original.type || 'break';
  this.data = original.data;
}
util.inherits(PausedEvent, DebuggerEvent);

module.exports = PausedEvent;
