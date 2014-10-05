'use strict';

var util = require('util');

var DebuggerEvent = require('./base');

function PausedEvent(reason, trace) {
  if (!this instanceof PausedEvent)
    return new PausedEvent(trace);

  DebuggerEvent.call(this, 'paused');

  // console.log(raw.body);
  this.backtrace = trace;
  this.reason = reason || 'break';
}
util.inherits(PausedEvent, DebuggerEvent);

module.exports = PausedEvent;
