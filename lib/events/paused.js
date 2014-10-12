'use strict';

var util = require('util');

var DebuggerEvent = require('./base');

function PausedEvent(original, trace) {
  if (!this instanceof PausedEvent)
    return new PausedEvent(trace);

  DebuggerEvent.call(this, 'paused');

  original = original || {};

  var reason = original.reason || 'break';

  this.backtrace = trace;
  this.reason = reason;
}
util.inherits(PausedEvent, DebuggerEvent);

module.exports = PausedEvent;
