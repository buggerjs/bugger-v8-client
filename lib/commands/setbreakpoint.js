'use strict';

/*
{ type: 'scriptRegExp',
  breakpoint: 2,
  script_regexp: 'three.js',
  line: 1,
  column: 0,
  actual_locations: [ { line: 1, column: 0, script_id: 59 } ] }
*/

function Breakpoint(type, id, actual) {
  this.type = type;
  this.id = id;
  this.actualLocations = actual;
}

function RegexpBreakpoint(id, regexp, line, column, actual) {
  Breakpoint.call(this, 'scriptRegExp', id, actual);
  this.regexp = regexp;
  this.line = line;
  this.column = column;
}

Breakpoint.unmarshal = function(raw) {
  // TODO: parse breakpoint
  switch (raw.type) {
    case 'scriptRegExp':
      return new RegexpBreakpoint(
        raw.breakpoint,
        raw.script_regexp,
        raw.line,
        raw.column,
        raw.actual_locations
      );
  }
};

module.exports = function(DebugClient) {
  DebugClient.prototype.setbreakpoint = function (opts) {
    return (
      this._sendRequest('setbreakpoint', opts)
      .then(function(raw) {
        return Breakpoint.unmarshal(raw.body);
      })
    );
  };
};
