'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('commands.lookup', function() {
  describe('lookupProperties', function() {
    describe('against three.js', function() {
      withBugger('three.js');

      it('can returns all scripts', function*() {
        var b = this.bugger;
        yield b.nextEvent('break');
        var props = yield b.lookupProperties('scope:0:0');
        console.log(props);
      });
    });
  });
});
