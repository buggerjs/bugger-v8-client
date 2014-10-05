'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('commands.scripts', function() {
  describe('against three.js', function() {
    withBugger('three.js');

    it('can returns all scripts', function*() {
      var b = this.bugger;
      yield b.nextEvent('break');
      var scripts = yield b.getScriptsWithSource();
      var lastScript = scripts[scripts.length - 1];
      expect(lastScript.url).to.contain('/three.js');
    });
  });
});
