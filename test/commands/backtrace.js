'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

import Backtrace from '../../lib/types/backtrace';

test('commands.backtrace', t => {
  buggerTest(t, 'empty.js', async (t, b) => {
    const backtrace = await b.backtrace();
    t.ok(backtrace instanceof Backtrace, 'is a Backtrace');
    t.ok(Array.isArray(backtrace.callFrames), 'has callFrames (array)');
  });

  buggerTest(t, 'evalbrk.js', async (t, b) => {
    b.resume();
    await b.nextEvent('break');

    const backtrace = await b.backtrace();

    t.ok(backtrace instanceof Backtrace, 'is a Backtrace');
    t.ok(Array.isArray(backtrace.callFrames), 'has callFrames (array)');
  });

  t.end();
});
