'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('empty.js', function() {
  withBugger('empty.js');

  it('retrieves events', function*() {
    var b = this.bugger;
    b.connect();
    var e = yield b.nextEvent('break');
    expect(e.location.script.name).to.match(/empty\.js$/);
    expect(e.location.line).to.be(1);
    expect(e.location.column).to.be(0);
  });
});
