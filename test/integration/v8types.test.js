var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

var fromV8Type = require('../../lib/types').fromV8Type;

describe('v8 types', function() {
  var ctx = withBugger('breakpoint.js', [], false);

  it('retrieves events', function(done) {
    ctx.bugger.connect(function() {
      ctx.bugger.once('paused', function(breakEvent) {
        try {
          var topFrame = breakEvent.callFrames[0];
          var topScope = topFrame.scopeChain[0];
          expect(topScope.object.objectId).to.be('scope:0:0');
          expect(topFrame.functionName).to.be('clazz.fn');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });
});
