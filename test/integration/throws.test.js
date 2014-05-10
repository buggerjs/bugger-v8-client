'use strict';

var withBugger = require('../helpers/with_bugger');
var expect = require('expect.js');

describe('throws', function() {
  withBugger('throws.js', []);

  it('can catch all exceptions', function(done) {
    var bugger = this.bugger;
    bugger.connect();
    bugger.once('paused', function() {
      bugger.setexceptionbreak({type:'all',enabled:true})
      .then(function() {
        bugger.once('paused', function(breakEvent) {
          try {
            expect(breakEvent.reason).to.be('exception');
            done();
          } catch (err) {
            done(err);
          }
        });

        bugger.continue();
      })
      .catch(done);
    });
  });
});
