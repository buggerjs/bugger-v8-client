'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('v8 types', function() {
  withBugger('breakpoint.js', [], false);

  it('retrieves events', function*() {
    var b = this.bugger;

    var breakEvent = yield b.nextEvent('paused');

    var backtrace = breakEvent.backtrace;
    var topFrame = backtrace.frames[0];
    var topScope = topFrame.scopes[0];

    expect(topScope.index).to.be(0);
    expect(topScope.frameIndex).to.be(0);
    expect(topScope.objectId).to.be('scope:0:0');
    expect(topFrame.func.displayName).to.be('clazz.fn');
  });
});
