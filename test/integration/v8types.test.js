'use strict';

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

describe('v8 types', function() {
  withBugger('breakpoint.js');

  it('retrieves events', function*() {
    var b = this.bugger;

    b.resume();
    var breakEvent = yield b.nextEvent('paused');

    var callFrames = breakEvent.callFrames;

    var topFrame = callFrames[0];
    assert.equal('clazz.fn', topFrame.functionName);

    var topScope = topFrame.scopeChain[0];
    assert.equal('local', topScope.type);
    assert.equal('scope:0:0', topScope.object.objectId);
  });
});
