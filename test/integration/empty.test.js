var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('empty.js', function() {
  var ctx = withBugger('empty.js');

  it('retrieves events', function(done) {
    ctx.bugger.connect(function() {
      ctx.bugger.once('break', function(e, refMap) {
        try {
          expect(e.script.name).to.match(/empty\.js$/);
          expect(e.script.lineOffset).to.be(0);
          expect(e.script.columnOffset).to.be(0);
          return done();
        } catch (err) {
          return done(err);
        }
      });
    });
  });

  it('can send requests', function(done) {
    ctx.bugger.connect(function() {
      ctx.bugger.once('break', function() {
        ctx.bugger._sendRequest(
          'backtrace',
          { inlineRefs: true },
          function(err, backtrace, refMap) {
            try {
              expect(err).to.be(null);
              var topFrame = backtrace.frames[0];
              var scriptRef = topFrame.script.ref;
              expect(scriptRef).to.be.a('number');
              var script = refMap[scriptRef.toString()];
              expect(script).to.be.an('object');
              expect(script.name).to.match(/empty\.js$/);
              return done();
            } catch (err) {
              return done(err);
            }
          }
        );
      });
    });
  });
});
