withBugger = require('../helpers/with_bugger');

describe('empty.js', function() {
  var ctx = withBugger('empty.js');

  it('boots and connects', function(done) {
    ctx.bugger.connect(function() {
      ctx.bugger.close(function() {
        done();
      });
    });
  });

  it('killing the process works', function(done) {
    ctx.bugger.connect(function() {
      done();
    });
  });
});
