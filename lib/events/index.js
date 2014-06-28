'use strict';

var DebuggerEvent = require('./base');
var BreakEvent = require('./break');
var AfterCompileEvent = require('./afterCompile');

module.exports = function createEvent(raw) {
  switch (raw.event) {
    case 'break':
    case 'exception':
      return new BreakEvent(raw);

    case 'afterCompile':
      return new AfterCompileEvent(raw);

    default:
      return new DebuggerEvent(raw.event);
  }
};
