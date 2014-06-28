'use strict';

var util = require('util');

var DebuggerEvent = require('./base');
var unmarshal = require('../types').unmarshal;

function AfterCompileEvent(raw) {
  if (!this instanceof AfterCompileEvent)
    return new AfterCompileEvent(raw);

  DebuggerEvent.call(this, raw.event);

  var rawScript = {
    body: raw.body.script,
    ref: raw.refs
  }

  this.script = unmarshal(rawScript, 'script');
}
util.inherits(AfterCompileEvent, DebuggerEvent);

module.exports = AfterCompileEvent;
