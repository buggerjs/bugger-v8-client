'use strict';

var util = require('util');

var DebuggerEvent = require('./base');

function BreakEvent(raw) {
  if (!this instanceof BreakEvent)
    return new BreakEvent(raw);

  DebuggerEvent.call(this, raw.event);

  this.location = {
    script: raw.body.script, // TODO: new Script(raw.body.script)
    line: raw.body.sourceLine,
    column: raw.body.sourceColumn,
    lineText: raw.body.sourceLineText
  };
  this.breakpoints = raw.body.breakpoints;
  this.invocationText = raw.body.invocationText;
}
util.inherits(BreakEvent, DebuggerEvent);

module.exports = BreakEvent;
