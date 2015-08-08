'use strict';

var test = require('blue-tape');
var async = require('bluebird').coroutine;

require('../helpers/bugger-test');

var Backtrace = require('../../lib/types/backtrace');

test('commands.backtrace', function(t) {
  t.buggerTest('empty.js', async(function *(t, b) {
    var backtrace = yield b.backtrace();
    t.ok(backtrace instanceof Backtrace, 'is a Backtrace');
    t.ok(Array.isArray(backtrace.callFrames), 'has callFrames (array)');
  }));

  t.buggerTest('evalbrk.js', async(function *(t, b) {
    b.resume();
    yield b.nextEvent('break');

    var backtrace = yield b.backtrace();

    t.ok(backtrace instanceof Backtrace, 'is a Backtrace');
    t.ok(Array.isArray(backtrace.callFrames), 'has callFrames (array)');
  }));

  t.end();
});
