'use strict';

var Path = require('path');

var test = require('blue-tape');
var async = require('bluebird').coroutine;

require('../helpers/bugger-test');

test('read meta information', function(t) {
  t.buggerTest('empty.js', [ 'arg1', 'arg2' ], async(function *(t, b, child, debugPort) {
    var meta = yield b.getMeta();

    t.equal(child.pid, meta.pid, 'pid is correct');

    // same working directory and node
    t.equal(process.cwd(), meta.cwd, 'cwd is correct');
    t.equal(process.execPath, meta.execPath, 'execPath is correct');
    // --debug-brk is expected
    t.deepEqual([ '--debug-brk=' + debugPort ], meta.execArgv,
      'execArgv is correct');

    t.equal(
      Path.resolve(__dirname, '../../example/empty.js'),
      meta.mainModule,
      'meta.mainModule is correct'
    );
    t.deepEqual([ 'arg1', 'arg2' ], meta.argv.slice(2),
      'argv is correct');
  }));
});
