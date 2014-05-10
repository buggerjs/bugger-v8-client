'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('throws', function() {
  withBugger('uncaught.js', []);

  if (require('semver').satisfies(process.version, '>=0.11.3')) {
    it('can catch uncaught exceptions', function(done) {
      this.bugger.connect(function() {
        this.bugger.once('paused', function() {
          this.bugger.setexceptionbreak(
            { type: 'uncaught', enabled: true },
            function(err) {
              if (err) return done(err);
              this.bugger.once('paused', function(breakEvent) {
                try {
                  expect(breakEvent.reason).to.be('exception');
                  done();
                } catch (err) {
                  done(err);
                }
              });

              this.bugger.continue();
            }.bind(this)
          );
        }.bind(this));
      }.bind(this));
    });
  }
});
