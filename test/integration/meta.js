'use strict';

import {resolve as resolvePath} from 'path';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('read meta information', t => {
  buggerTest(t, 'empty.js', [ 'arg1', 'arg2' ], async (t, b, child, debugPort) => {
    const meta = await b.getMeta();

    t.equal(child.pid, meta.pid, 'pid is correct');

    // same working directory and node
    t.equal(process.cwd(), meta.cwd, 'cwd is correct');
    t.equal(process.execPath, meta.execPath, 'execPath is correct');
    // --debug-brk is expected
    t.deepEqual([ '--debug-brk=' + debugPort ], meta.execArgv,
      'execArgv is correct');

    t.equal(
      resolvePath(__dirname, '../../example/empty.js'),
      meta.mainModule,
      'meta.mainModule is correct'
    );
    t.deepEqual([ 'arg1', 'arg2' ], meta.argv.slice(2),
      'argv is correct');
  });
});
