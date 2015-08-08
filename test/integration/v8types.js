'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('v8 types, breakEvent', t => {
  buggerTest(t, 'breakpoint.js', async (t, b) => {
    b.resume();
    const {callFrames: [topFrame]} = await b.nextEvent('paused');

    t.ok(typeof topFrame.functionName === 'string',
      'functionName of topFrame is a string (' + topFrame.functionName + ')');

    const [topScope] = topFrame.scopeChain;
    t.equal(topScope.type, 'local', 'top scope of top frame is "local"');
    t.equal('scope:0:0', topScope.object.objectId,
      'the object id of the scope 0, frame 0 is "scope:0:0"');
  });
});
