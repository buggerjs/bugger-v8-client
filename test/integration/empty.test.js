withBugger = require('../helpers/with_bugger');

describe('empty.js', function() {
  var ctx = withBugger('empty.js');

  it('boots and connects', function(done) {
    ctx.bugger.connect(function() {
      done();
    });
  });
});
