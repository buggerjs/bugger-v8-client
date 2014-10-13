'use strict';

var Path = require('path');

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

describe('empty.js', function() {
  withBugger('empty.js', [ 'arg1', 'arg2' ]);

  it('can retrieve meta data about the process', function*() {
    var b = this.bugger;
    var c = this.child;

    var meta = yield b.getMeta();

    assert.equal(c.pid, meta.pid);

    // same working directory and node
    assert.equal(process.cwd(), meta.cwd);
    assert.equal(process.execPath, meta.execPath);
    // --debug-brk is expected
    assert.deepEqual([ '--debug-brk=' + b.debugPort ], meta.execArgv);

    assert.equal(
      Path.resolve(__dirname, '../../example/empty.js'),
      meta.mainModule
    );
    assert.deepEqual([ 'arg1', 'arg2' ], meta.argv.slice(2));
  });
});
