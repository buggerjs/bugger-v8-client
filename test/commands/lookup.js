'use strict';

var assert = require('assertive');
var _ = require('lodash');

var withBugger = require('../helpers/with_bugger');

describe('commands.lookup', function() {
  describe('lookupProperties', function() {
    describe('against three.js', function() {
      withBugger('three.js');

      it('returns the stuff in scope (a, exports, ...)', function*() {
        var b = this.bugger;
        var props = yield b.lookupProperties('scope:0:0', false);

        assert.truthy(_.find(props, { name: 'a' }));
        assert.truthy(_.find(props, { name: 'exports' }));
        assert.truthy(_.find(props, { name: '__dirname' }));
      });
    });
  });
});
