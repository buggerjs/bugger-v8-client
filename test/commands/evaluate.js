'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

import Backtrace from '../../lib/types/backtrace';

test('commands.backtrace', t => {
  buggerTest(t, 'empty.js', async (t, b) => {
    const buffer = (await b.evalNoBreak('new Buffer(42)', 0)).result;
    t.equal(buffer.className, 'Buffer', 'Detects className is Buffer');
    t.equal(buffer.subtype, 'array', 'Knows that a Buffer is ~= array');
    t.equal(buffer.description, 'Buffer[42]', 'Includes size in description');
  });
});
