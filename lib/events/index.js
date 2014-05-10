'use strict';

var DebuggerEvent = require('./base');
var BreakEvent = require('./break');

module.exports = function createEvent(raw) {
  switch (raw.event) {
    case 'break':
      return new BreakEvent(raw);

    default:
      return new DebuggerEvent(raw);
  }
};
