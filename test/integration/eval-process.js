'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('evaluate `process.*`, paused state', t => {
  buggerTest(t, 'three.js', async (t, b, child) => {
    async function evalNoThrow(expr) {
      const {wasThrown, result} = await b.evalNoBreak(expr, 0);
      t.ok(!wasThrown, '`' + expr + '` successfully evaluated');
      return result;
    }

    const pid = await evalNoThrow('process.pid');
    t.equal(pid.type, 'number', '`process.pid` is a number');
    t.equal(pid.value, child.pid, '`process.pid` matches the pid of the child');

    const env = await evalNoThrow('process.env');
    t.equal(env.type, 'object', '`process.env` is an object');
    t.ok(env.objectId.indexOf('scope-handle:') !== -1, '`process.env` has a scope-handle');

    const proc = await evalNoThrow('process');
    t.equal(proc.type, 'object', '`process` is an object');
    t.ok(proc.objectId.indexOf('scope-handle:') !== -1, '`process` has a scope-handle');
    t.equal(proc.className, 'process', '`process` has itself as a className');
  });
});
