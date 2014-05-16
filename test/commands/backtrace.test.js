'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

var Backtrace = require('../../lib/types/backtrace');

describe('commands.backtrace', function() {
  describe('against empty.js', function() {
    withBugger('empty.js');

    var backtrace = null;

    beforeEach(function*() {
      var b = this.bugger;
      yield b.connect();
      if (b.running !== false)
        yield b.nextEvent('break');

      backtrace = yield b.backtrace();
    });

    it('can retrieve a backtrace', function() {
      expect(backtrace).to.be.a(Backtrace);
      expect(backtrace.frames).to.be.an('array');
    });
  });

  describe('against evalbrk.js', function() {
    withBugger('evalbrk.js');

    var backtrace = null;

    beforeEach(function*() {
      var b = this.bugger;
      yield b.connect();
      if (b.running !== false)
        yield b.nextEvent('break');
      yield b.resume();
      yield b.nextEvent('break');

      backtrace = yield b.backtrace();
    });

    it('can retrieve a backtrace', function() {
      expect(backtrace).to.be.a(Backtrace);
      expect(backtrace.frames).to.be.an('array');
    });
  });
});
