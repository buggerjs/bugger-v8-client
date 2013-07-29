var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

var fromV8Type = require('../../lib/types').fromV8Type;

describe('throws', function() {
  var ctx = withBugger('uncaught.js', []);

  if (require('semver').satisfies(process.version, '>=0.11.3')) {
    it('can catch uncaught exceptions', function(done) {
      ctx.bugger.connect(function() {
        ctx.bugger.once('paused', function() {
          ctx.bugger.setexceptionbreak('uncaught', function(err, newState) {
            if (err != null) return done(err);
            ctx.bugger.once('paused', function(breakEvent) {
              try {
                expect(newState).to.be('uncaught');
                expect(breakEvent.reason).to.be('exception');
                done();
              } catch (err) {
                done(err);
              }
            });

            ctx.bugger.continue();
          });
        });
      });
    });
  }
});
