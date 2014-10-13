'use strict';

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

describe('throws', function() {
  withBugger('uncaught.js', []);

  if (require('semver').satisfies(process.version, '>=0.11.3')) {
    it('can catch uncaught exceptions', function*() {
      var b = this.bugger;

      yield b.setexceptionbreak({ type: 'uncaught', enabled: true });

      b.continue();
      var breakEvent = yield b.nextEvent('paused');

      assert.equal('exception', breakEvent.reason);
    });
  }
});
