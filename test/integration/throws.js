'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('breaking on exception', t => {
  buggerTest(t, 'throws.js', async (t, b) => {
    await b.setexceptionbreak({ type: 'all', enabled: true });

    b.continue();
    const pausedEvent = await b.nextEvent('paused');

    t.equal('exception', pausedEvent.reason, 'break reason is exception');
    t.ok(pausedEvent.data, 'pausedEvent has .data');
    t.equal('Error', pausedEvent.data.className,
      '.data correctly identifies error className');
  });
});
