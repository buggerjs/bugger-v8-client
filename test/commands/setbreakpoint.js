'use strict';

var test = require('blue-tape');
var async = require('bluebird').coroutine;

require('../helpers/bugger-test');

test('commands.setbreakpoint', function(t) {
  t.buggerTest('three.js', async(function *(t, b) {
    var breakpoint = yield b.setbreakpoint({
      type: 'scriptRegExp', target: 'three.js', line: 1, column: 0 });
    t.deepEqual([ 1, 0 ], [ breakpoint.lineNumber, breakpoint.columnNumber ],
      'break point is at line 1, column 0');

    b.resume();
    var breakEvent = yield b.nextEvent('break');
    t.deepEqual([ 1, 0 ], [ breakEvent.location.line, breakEvent.location.column ],
      'script pauses at [ 1, 0 ]');
  }));
});
