'use strict';
var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

describe('throws', function() {
  withBugger('throws.js');

  it('can catch all exceptions', function*() {
    var b = this.bugger;

    yield b.setexceptionbreak({ type: 'all', enabled: true });

    b.continue();
    var pausedEvent = yield b.nextEvent('paused');

    assert.equal('exception', pausedEvent.reason);
    assert.truthy(pausedEvent.data);
    assert.equal('Error', pausedEvent.data.className);
  });
});
