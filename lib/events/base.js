'use strict';

function DebuggerEvent(name) {
  this.type = 'event';
  this.event = '' + name;
}

module.exports = DebuggerEvent;
