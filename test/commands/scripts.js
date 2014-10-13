'use strict';

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

describe('commands.scripts', function() {
  describe('against three.js', function() {
    withBugger('three.js');

    it('can returns all scripts', function*() {
      var b = this.bugger;
      var scripts = yield b.getScriptsWithSource();
      var lastScript = scripts[scripts.length - 1];
      assert.include('/three.js', lastScript.url);
    });
  });
});
