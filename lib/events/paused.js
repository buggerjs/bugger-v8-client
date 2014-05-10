'use strict';

var util = require('util');

var DebuggerEvent = require('./base');

function PausedEvent(original, trace) {
  if (!this instanceof PausedEvent)
    return new PausedEvent(trace);

  DebuggerEvent.call(this, 'paused');

  // console.log(raw.body);
  this.backtrace = trace;
  this.reason = '' + original.type;
}
util.inherits(PausedEvent, DebuggerEvent);

module.exports = PausedEvent;
