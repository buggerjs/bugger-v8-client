'use strict';

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

describe('commands.backtrace', function() {
  describe('against three.js', function() {
    withBugger('three.js');

    it('can break at a line', function*() {
      var b = this.bugger;
      var breakpoint = yield b.setbreakpoint({
        type: 'scriptRegExp', target: 'three.js', line: 1, column: 0 });
      assert.equal(1, breakpoint.lineNumber);
      assert.equal(0, breakpoint.columnNumber);

      b.resume();
      var breakEvent = yield b.nextEvent('break');
      assert.equal(1, breakEvent.location.line);
      assert.equal(0, breakEvent.location.column);
    });
  });
});
