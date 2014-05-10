'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('empty.js', function() {
  withBugger('empty.js');

  it('retrieves events', function(done) {
    this.bugger.connect(function() {
      this.bugger.once('break', function(e) {
        try {
          expect(e.script.name).to.match(/empty\.js$/);
          expect(e.script.lineOffset).to.be(0);
          expect(e.script.columnOffset).to.be(0);
          return done();
        } catch (err) {
          return done(err);
        }
      });
    }.bind(this));
  });
});
