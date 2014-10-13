'use strict';

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

describe('commands.backtrace', function() {
  describe('against empty.js', function() {
    withBugger('three.js');

    it('can break at a line', function*() {
      var b = this.bugger;
      yield b.setbreakpoint({
        type: 'scriptRegExp', target: 'three.js', line: 1, column: 0 });

      var breaks = yield b.listbreakpoints();
      assert.equal(false, breaks.breakOnExceptions);
      assert.equal(false, breaks.breakOnUncaughtExceptions);

      var points = breaks.breakpoints;
      assert.hasType(Array, points);
      assert.equal(2, points.length);

      // 1. initial breakpoint / --debug-brk
      assert.equal('scriptId', points[0].type);
      assert.equal(0, points[0].lineNumber);
      assert.equal(10, points[0].columnNumber);

      // 2. custom breakpoint
      assert.equal('scriptRegExp', points[1].type);
      assert.equal(1, points[1].lineNumber);
      assert.equal(0, points[1].columnNumber);
    });
  });
});
