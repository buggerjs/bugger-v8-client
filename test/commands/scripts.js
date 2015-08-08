'use strict';

var test = require('blue-tape');
var async = require('bluebird').coroutine;
var _ = require('lodash');

require('../helpers/bugger-test');

test('commands.scripts', function(t) {
  t.buggerTest('three.js', async(function *(t, b) {
    var scripts = yield b.getScriptsWithSource();
    var threeScript = _.find(scripts, function(s) {
      return s.url.indexOf('example/three.js') !== -1;
    });
    t.ok(threeScript, 'finds example/three.js in scripts');
  }));
});
