'use strict';

var assert = require('assertive');
var _ = require('lodash');

var withBugger = require('../helpers/with_bugger');

describe('commands.scripts', function() {
  describe('against three.js', function() {
    withBugger('three.js');

    it('can returns all scripts', function*() {
      var b = this.bugger;
      var scripts = yield b.getScriptsWithSource();
      var threeScript = _.find(scripts, function(s) {
        return s.url.indexOf('example/three.js') !== -1;
      });
      assert.truthy(threeScript);
    });
  });
});
