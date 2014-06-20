'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('throws', function() {
  withBugger('uncaught.js', []);

  if (require('semver').satisfies(process.version, '>=0.11.3')) {
    it('can catch uncaught exceptions', function*() {
      var b = this.bugger;
      
      yield b.nextEvent('paused');

      yield b.setexceptionbreak({ type: 'uncaught', enabled: true });

      b.continue();
      var breakEvent = yield b.nextEvent('paused');

      expect(breakEvent.reason).to.be('exception');
    });
  }
});
