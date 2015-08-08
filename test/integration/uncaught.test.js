'use strict';

var semver = require('semver');
var test = require('blue-tape');
var async = require('bluebird').coroutine;

require('../helpers/bugger-test');

test('break on uncaught exception', function(t) {
  if (!semver.satisfies(process.version, '>=0.11.3')) {
    t.skip('node >=0.11.3 only');
    t.end();
    return;
  }

  t.buggerTest('uncaught.js', async(function *(t, b) {
    yield b.setexceptionbreak({ type: 'uncaught', enabled: true });

    b.continue();
    var breakEvent = yield b.nextEvent('paused');

    t.equal(breakEvent.reason, 'exception', 'paused because of exception');
  }));
});
