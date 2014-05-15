'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

var Backtrace = require('../../lib/types/backtrace');

describe('commands.backtrace', function() {
  describe('against empty.js', function() {
    withBugger('empty.js');

    var backtrace = null;

    beforeEach(function(done) {
      var bugger = this.bugger;
      bugger.connect(function() {
        bugger.once('break', function() {
          bugger.backtrace()
          .then(function(result) {
            backtrace = result;
          })
          .nodeify(done);
        });
      });
    });

    it('can retrieve a backtrace', function() {
      expect(backtrace).to.be.a(Backtrace);
      expect(backtrace.frames).to.be.an('array');
    });
  });

  describe('against evalbrk.js', function() {
    withBugger('evalbrk.js');

    var backtrace = null;

    beforeEach(function(done) {
      var bugger = this.bugger;
      bugger.connect(function() {
        bugger.once('break', function() {
          bugger.continue();
          bugger.once('break', function() {
            bugger.backtrace()
            .then(function(result) {
              backtrace = result;
            })
            .nodeify(done);
          });
        });
      });
    });

    it('can retrieve a backtrace', function() {
      expect(backtrace).to.be.a(Backtrace);
      expect(backtrace.frames).to.be.an('array');
    });
  });
});
