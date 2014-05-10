'use strict';

function DebuggerEvent(raw) {
  this.type = 'event';
  this.event = '' + raw.event;
  this.running = !!raw.running;
  this.sequence = +raw.seq;
}

module.exports = DebuggerEvent;
