'use strict';

var test = require('blue-tape');
var async = require('bluebird').coroutine;
var _ = require('lodash');

require('../helpers/bugger-test');

test('commands.lookupProperties', function(t) {
  t.buggerTest('three.js', async(function *(t, b) {
    var props = yield b.lookupProperties('scope:0:0', false);

    t.ok(_.find(props, { name: 'a' }), 'finds `a` in scope');
    t.ok(_.find(props, { name: 'exports' }), 'finds `exports` in scope');
    t.ok(_.find(props, { name: '__dirname' }), 'finds `__dirname` in scope');
  }));
});
