'use strict';

import test from 'blue-tape';
import {find} from 'lodash';

import buggerTest from '../helpers/bugger-test';

test('commands.lookupProperties', t => {
  buggerTest(t, 'three.js', async (t, b) => {
    const props = await b.lookupProperties('scope:0:0', false);

    t.ok(find(props, { name: 'a' }), 'finds `a` in scope');
    t.ok(find(props, { name: 'exports' }), 'finds `exports` in scope');
    t.ok(find(props, { name: '__dirname' }), 'finds `__dirname` in scope');
  });

  buggerTest(t, 'big-buffer.js', [], true, async (t, b) => {
    b.resume();
    await b.nextEvent('break');

    const props = await b.lookupProperties('scope:0:0', false);
    const buffer = find(props, { name: 'buffer' }).value;

    t.equal(buffer.className, 'Buffer',
      'The className matches the... well, class name');

    t.equal(buffer.description, 'Buffer[150]',
      'The description of a buffer is array-like');
  });
});
