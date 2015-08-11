'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('v8 types, breakEvent', t => {
  buggerTest(t, 'breakpoint.js', async (t, b) => {
    await b.resume();
    const {callFrames: [topFrame]} = await b.nextEvent('paused');

    t.equal(topFrame.functionName, '_fn',
      'functionName of topFrame is a string (' + topFrame.functionName + ')');

    t.equal(topFrame.scopeChain[0].type, 'local', 'Top-most scope is local');
    t.equal(topFrame.scopeChain[1].type, 'closure', 'Below is a closure scope');
    if (topFrame.scopeChain.length === 4) {
      // has a script scope
      t.equal(topFrame.scopeChain[2].type, 'script', 'Before global scope, there\'s a script scope');
    }
    t.equal(topFrame.scopeChain[topFrame.scopeChain.length - 1].type, 'global', 'Bottom scope is global');

    const [topScope] = topFrame.scopeChain;
    t.equal(topScope.type, 'local', 'top scope of top frame is "local"');
    t.equal('scope:0:0', topScope.object.objectId,
      'the object id of the scope 0, frame 0 is "scope:0:0"');

    // looking up the scope properties forces v8 to acknowledge what's in scope
    const props = await b.lookupProperties(topFrame.scopeChain[0].object.objectId, false);

    const evalClazz = await b.evalNoBreak('clazz', 0);
    if (evalClazz.wasThrown === true) {
      console.log(evalClazz.result);
      throw new Error(evalClazz.result.description)
    }
    t.ok(evalClazz.result.objectId, '`clazz` has an object id');
  });
});
