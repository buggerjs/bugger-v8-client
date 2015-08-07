'use strict';

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

var Backtrace = require('../../lib/types/backtrace');

describe('commands.backtrace', function() {
  describe('against empty.js', function() {
    withBugger('empty.js');

    var backtrace = null;

    beforeEach(function*() {
      var b = this.bugger;
      backtrace = yield b.backtrace();
    });

    it('can retrieve a backtrace', function() {
      assert.truthy(backtrace instanceof Backtrace);
      assert.hasType(Array, backtrace.callFrames);
    });
  });

  describe('against evalbrk.js', function() {
    withBugger('evalbrk.js');

    var backtrace = null;

    beforeEach('get backtrace', function*() {
      var b = this.bugger;
      b.resume();
      yield b.nextEvent('break');

      backtrace = yield b.backtrace();
    });

    it('can retrieve a backtrace', function() {
      assert.truthy(backtrace instanceof Backtrace);
      assert.hasType(Array, backtrace.callFrames);
    });
  });
});
