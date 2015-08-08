import {resolve as resolvePath} from 'path';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('storeNativeModule', t => {
  async function verifyNativeModuleAvailable(t, b) {
    t.equal(await b.evalSimple('typeof __bugger__'), 'undefined',
      '__bugger__ starts as undefined');

    t.equal(await b.storeNativeModule(), true, 'Injection is successful');

    t.equal(await b.evalSimple('typeof __bugger__.require'), 'function',
      'Exposes require globally');

    const loadedScripts =
      await b.evalSimple('Object.keys(__bugger__.require("module")._cache)');
    t.ok(Array.isArray(loadedScripts), 'the module cache is exposed');

    t.deepEqual(loadedScripts, [
      resolvePath(__dirname, '..', '..', 'example', 'alive.js')
    ], 'require cache only includes alive.js');
  }

  buggerTest(t, 'alive.js', verifyNativeModuleAvailable);

  buggerTest(t, 'alive.js', async (t, b) => {
    t.comment('not paused');
    await b.resume();
    return verifyNativeModuleAvailable(t, b);
  });

  t.end();
});
