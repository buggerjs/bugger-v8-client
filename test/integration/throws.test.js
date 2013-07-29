var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

var fromV8Type = require('../../lib/types').fromV8Type;

describe('throws', function() {
  var ctx = withBugger('throws.js', []);

  it('can catch all exceptions', function(done) {
    ctx.bugger.connect(function() {
      ctx.bugger.once('paused', function() {
        ctx.bugger.setexceptionbreak({type:'all',enabled:true}, function(err) {
          if (err != null) return done(err);
          ctx.bugger.once('paused', function(breakEvent) {
            try {
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
});
