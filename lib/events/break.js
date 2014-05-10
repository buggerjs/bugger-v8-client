'use strict';

var util = require('util');

var DebuggerEvent = require('./base');

function BreakEvent(raw) {
  if (!this instanceof BreakEvent)
    return new BreakEvent(raw);

  DebuggerEvent.call(this, raw);

  // console.log(raw.body);
  this.script = raw.body.script; // TODO: new Script(raw.body.script)
}
util.inherits(BreakEvent, DebuggerEvent);

module.exports = BreakEvent;
