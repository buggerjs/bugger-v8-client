'use strict';

var Path = require('path');

var expect = require('expect.js');

var withBugger = require('../helpers/with_bugger');

describe('empty.js', function() {
  withBugger('empty.js', [ 'arg1', 'arg2' ]);

  it('can retrieve meta data about the process', function*() {
    var b = this.bugger;
    var c = this.child;

    b.connect();
    yield b.nextEvent('break');

    var meta = yield b.getMeta();

    expect(meta.pid).to.equal(c.pid);

    // same working directory and node
    expect(meta.cwd).to.equal(process.cwd());
    expect(meta.execPath).to.equal(process.execPath);
    // --debug-brk is expected
    expect(meta.execArgv).to.eql([ '--debug-brk=' + b.debugPort ]);

    expect(meta.mainModule).to.eql(
      Path.resolve(__dirname, '../buggers/empty.js')
    );
    expect(meta.argv.slice(2)).to.eql([ 'arg1', 'arg2' ]);
  });
});
