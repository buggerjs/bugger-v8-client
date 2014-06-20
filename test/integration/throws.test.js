'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('throws', function() {
  withBugger('throws.js', []);

  it('can catch all exceptions', function*() {
    var b = this.bugger;

    yield b.nextEvent('paused');

    yield b.setexceptionbreak({ type: 'all', enabled: true });

    b.continue();
    var breakEvent = yield b.nextEvent('paused');

    expect(breakEvent.reason).to.be('exception');
  });
});
