'use strict';

var test = require('blue-tape');
var async = require('bluebird').coroutine;

require('../helpers/bugger-test');

test('breaking on exception', function(t) {
  t.buggerTest('throws.js', async(function *(t, b) {
    yield b.setexceptionbreak({ type: 'all', enabled: true });

    b.continue();
    var pausedEvent = yield b.nextEvent('paused');

    t.equal('exception', pausedEvent.reason, 'break reason is exception');
    t.ok(pausedEvent.data, 'pausedEvent has .data');
    t.equal('Error', pausedEvent.data.className,
      '.data correctly identifies error className');
  }));
});
