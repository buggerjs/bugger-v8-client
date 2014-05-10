'use strict';

var util = require('util');

var DebuggerEvent = require('./base');

function PausedEvent(trace, reason) {
  if (!this instanceof PausedEvent)
    return new PausedEvent(trace);

  DebuggerEvent.call(this, 'paused');

  // console.log(raw.body);
  this.backtrace = trace;
  this.reason = '' + reason;
}
util.inherits(PausedEvent, DebuggerEvent);

module.exports = PausedEvent;
