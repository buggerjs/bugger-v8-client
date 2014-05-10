'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('v8 types', function() {
  withBugger('breakpoint.js', [], false);

  it('retrieves events', function(done) {
    this.bugger.connect(function() {
      this.bugger.once('paused', function(breakEvent) {
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
    }.bind(this));
  });
});
