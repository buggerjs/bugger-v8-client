import {resolve as resolvePath} from 'path';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('prepareGlobalRequire', t => {
  async function verifyNativeModuleAvailable(t, b) {
    t.equal(await b.evalSimple('typeof __bugger__'), 'undefined',
      '__bugger__ starts as undefined');

    t.equal(await b.prepareGlobalRequire(), true, 'Injection is successful');

    t.equal(await b.evalSimple('typeof __bugger__.require'), 'function',
      'Exposes require globally');

    const loadedScripts =
      await b.evalSimple('Object.keys(__bugger__.require("module")._cache)');
    t.ok(Array.isArray(loadedScripts), 'the module cache is exposed');

    const isEval = await b.evalSimple('process.mainModule === undefined');

    if (isEval) {
      t.deepEqual(loadedScripts, [],
        'require cache is empty (because --eval)');
    } else {
      t.deepEqual(loadedScripts, [
        resolvePath(__dirname, '..', '..', 'example', 'alive.js')
      ], 'require cache only includes alive.js');
    }
  }

  buggerTest(t, 'alive.js', verifyNativeModuleAvailable);

  buggerTest(t, 'alive.js', [], false, verifyNativeModuleAvailable);

  function alive() {
    console.log('alive');
    setInterval(function() {
      console.log('tick');
    }, 10 * 1000);
  }

  // --debug-brk doesn't work as-expected w/ eval
  buggerTest(t, alive, [], false, async (t, b) => {
    t.equal(await b.evalSimple('typeof process.mainModule'), 'undefined',
      'process.mainModule is undefined for --eval etc.');

    await b.pause();

    return verifyNativeModuleAvailable(t, b);
  });

  buggerTest(t, alive, [], false, async (t, b) => {
    t.equal(await b.evalSimple('typeof process.mainModule'), 'undefined',
      'process.mainModule is undefined for --eval etc.');

    return verifyNativeModuleAvailable(t, b);
  });

  t.end();
});
