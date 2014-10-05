'use strict';

var _ = require('lodash');
var util = require('util');

function Breakpoint(type, id, line, column, actual) {
  this.type = type;
  this.breakpointId = '' + id;
  this.lineNumber = line;
  this.columnNumber = column;
  this.actualLocations = actual;
}

function RegExpBreakpoint(id, regexp, line, column, actual) {
  Breakpoint.call(this, 'scriptRegExp', id, line, column, actual);
  this.regExp = regexp;
}
util.inherits(RegExpBreakpoint, Breakpoint);

function ScriptBreakpoint(id, scriptId, line, column, actual) {
  Breakpoint.call(this, 'scriptId', id, line, column, actual);
  this.scriptId = scriptId;
}
util.inherits(ScriptBreakpoint, Breakpoint);

function ScriptNameBreakpoint(id, name, line, column, actual) {
  Breakpoint.call(this, 'scriptName', id, line, column, actual);
  this.scriptName = name;
}

function makeLocation(loc) {
  return {
    lineNumber: loc.line,
    columnNumber: loc.column,
    scriptId: '' + loc.script_id
  };
}

Breakpoint.unmarshal = function(raw) {
  // TODO: parse breakpoint
  switch (raw.type) {
    case 'scriptId':
      /*
      { number: 1,
        line: 0,
        column: 10,
        groupId: null,
        hit_count: 1,
        active: true,
        condition: null,
        ignoreCount: 0,
        actual_locations: [ { line: 0, column: 62, script_id: 59 } ],
        type: 'scriptId',
        script_id: 59 }
      */
      return new ScriptBreakpoint(
        raw.breakpoint || raw.number,
        raw.script_id,
        raw.line,
        raw.column,
        raw.actual_locations.map(makeLocation)
      );

    case 'scriptName':
      return new ScriptNameBreakpoint(
        raw.breakpoint || raw.number,
        raw.script_name,
        raw.line,
        raw.column,
        raw.actual_locations.map(makeLocation)
      );

    case 'scriptRegExp':
      /*
      { number: 2,
        line: 1,
        column: 0,
        groupId: null,
        hit_count: 0,
        active: true,
        condition: null,
        ignoreCount: 0,
        actual_locations: [ { line: 1, column: 0, script_id: 59 } ],
        type: 'scriptRegExp',
        script_regexp: 'three.js' }
      */
      /*
      { type: 'scriptRegExp',
        breakpoint: 2,
        script_regexp: 'three.js',
        line: 1,
        column: 0,
        actual_locations: [ { line: 1, column: 0, script_id: 59 } ] }
      */
      return new RegExpBreakpoint(
        raw.breakpoint || raw.number,
        raw.script_regexp,
        raw.line,
        raw.column,
        raw.actual_locations.map(makeLocation)
      );
  }
  throw new Error('Unknown breakpoint type: ' + raw.type);
};

module.exports = Breakpoint;
