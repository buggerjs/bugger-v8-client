'use strict';

var test = require('blue-tape');
var async = require('bluebird').coroutine;

require('../helpers/bugger-test');

test('evaluate `process.*`, paused state', function(t) {
  t.buggerTest('three.js', async(function *(t, b, child) {
    function evalNoThrow(expr) {
      return b.evalNoBreak(expr, 0)
        .then(function(remoteObject) {
          t.ok(!remoteObject.wasThrown, '`' + expr + '` successfully evaluated');
          return remoteObject.result;
        });
    }

    var pid = yield evalNoThrow('process.pid');
    t.equal(pid.type, 'number', '`process.pid` is a number');
    t.equal(pid.value, child.pid, '`process.pid` matches the pid of the child');

    var env = yield evalNoThrow('process.env');
    t.equal(env.type, 'object', '`process.env` is an object');
    t.ok(env.objectId.indexOf('scope-handle:') !== -1, '`process.env` has a scope-handle');

    var proc = yield evalNoThrow('process');
    t.equal(proc.type, 'object', '`process` is an object');
    t.ok(proc.objectId.indexOf('scope-handle:') !== -1, '`process` has a scope-handle');
    t.equal(proc.className, 'process', '`process` has itself as a className');
  }));
});
