'use strict';

var test = require('blue-tape');
var async = require('bluebird').coroutine;

require('../helpers/bugger-test');

test('v8 types, breakEvent', function(t) {
  t.buggerTest('breakpoint.js', async(function *(t, b) {
    b.resume();
    var breakEvent = yield b.nextEvent('paused');

    var callFrames = breakEvent.callFrames;

    var topFrame = callFrames[0];
    t.ok(typeof topFrame.functionName === 'string',
      'functionName of topFrame is a string (' + topFrame.functionName + ')');

    var topScope = topFrame.scopeChain[0];
    t.equal(topScope.type, 'local', 'top scope of top frame is "local"');
    t.equal('scope:0:0', topScope.object.objectId,
      'the object id of the scope 0, frame 0 is "scope:0:0"');
  }));
});
