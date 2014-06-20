'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('commands.backtrace', function() {
  describe('against empty.js', function() {
    withBugger('three.js');

    it('can break at a line', function*() {
      var b = this.bugger;
      yield b.nextEvent('break');
      yield b.setbreakpoint({
        type: 'scriptRegExp', target: 'three.js', line: 1, column: 0 });

      var breaks = yield b.listbreakpoints();
      expect(breaks).to.have.property('breakOnExceptions', false);
      expect(breaks).to.have.property('breakOnUncaughtExceptions', false);
      expect(breaks).to.have.property('breakpoints');
      var points = breaks.breakpoints;
      expect(points).to.have.property('length', 2);

      // 1. initial breakpoint / --debug-brk
      expect(points[0]).to.have.property('type', 'scriptId');
      expect(points[0]).to.have.property('line', 0);
      expect(points[0]).to.have.property('column', 10);

      // 2. custom breakpoint
      expect(points[1]).to.have.property('type', 'scriptRegExp');
      expect(points[1]).to.have.property('line', 1);
      expect(points[1]).to.have.property('column', 0);
    });
  });
});
