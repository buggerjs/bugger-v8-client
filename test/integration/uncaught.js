'use strict';

import {satisfies} from 'semver';
import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('break on uncaught exception', t => {
  if (!satisfies(process.version, '>=0.11.3')) {
    t.skip('node >=0.11.3 only');
    t.end();
    return;
  }

  if (!satisfies(process.version, '<3')) {
    t.skip('io.js v3 does not break for some reason');
    t.end();
    return;
  }

  buggerTest(t, 'uncaught.js', async (t, b) => {
    await b.setexceptionbreak({ type: 'uncaught', enabled: true });

    b.continue();

    const {reason} = await b.nextEvent('paused');
    t.equal(reason, 'exception', 'paused because of exception');
  });
});
