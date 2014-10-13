'use strict';

var assert = require('assertive');

var withBugger = require('../helpers/with_bugger');

var Backtrace = require('../../lib/types/backtrace');

describe('commands.evaluate', function() {
  describe('evaluate `process.pid`, paused state', function() {
    withBugger('three.js');

    beforeEach(function*() {
      var remoteObject = yield this.bugger.evalNoBreak('process.pid', 0);
      this.wasThrown = remoteObject.wasThrown;
      this.result = remoteObject.result;
    });

    it('returns a remote object, number', function() {
      assert.equal(false, this.wasThrown);
      assert.equal('number', this.result.type);
      assert.equal(this.child.pid, this.result.value);
    });
  });

  describe('evaluate `process.env`, paused state', function() {
    withBugger('three.js');

    beforeEach(function*() {
      var remoteObject = yield this.bugger.evalNoBreak('process.env', 0);
      this.wasThrown = remoteObject.wasThrown;
      this.result = remoteObject.result;
    });

    it('returns a remote object', function() {
      assert.equal(false, this.wasThrown);
      assert.equal('object', this.result.type);
      assert.include('scope-handle:', this.result.objectId);
    });
  });

  describe('evaluate `process`, paused state', function() {
    withBugger('three.js');

    beforeEach(function*() {
      var remoteObject = yield this.bugger.evalNoBreak('process', 0);
      this.wasThrown = remoteObject.wasThrown;
      this.result = remoteObject.result;
    });

    it('returns a remote object', function() {
      assert.equal(false, this.wasThrown);
      assert.equal('object', this.result.type);
      assert.include('scope-handle:', this.result.objectId);
      assert.equal('process', this.result.className);
    });
  });
});
