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
});
