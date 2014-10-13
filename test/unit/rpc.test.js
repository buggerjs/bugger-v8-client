'use strict';

var assert = require('assertive');

var RPCStream = require('../../lib/streams/rpc');
var ParseStream = require('../../lib/streams/parse');

var rawBreakEvent = {
  type: 'event',
  event: 'break',
  running: false,
  body: {
    invocationText: 'foo',
    script: {}
  }
};

describe('RPCStream', function() {
  it('is a function', function() {
    assert.hasType(Function, RPCStream);
  });

  describe('when writing an event object', function() {
    before(function() {
      this.rpc = new RPCStream();
    });

    it('emits a matching event', function(done) {
      this.rpc.on('break', function(breakEvent) {
        assert.equal('object', typeof breakEvent.location.script);
        done();
      });
      this.rpc.write(rawBreakEvent);
    });
  });

  describe('together with parser', function() {
    before(function() {
      this.parser = new ParseStream();
      this.rpc = new RPCStream();

      this.parser.pipe(this.rpc);
    });

    it('properly parses events', function(done) {
      this.rpc.on('break', function(breakEvent) {
        assert.equal('object', typeof breakEvent.location.script);
        done();
      });
      var serialized = JSON.stringify(rawBreakEvent);
      this.parser.write('Content-Length: ' + serialized.length);
      this.parser.write('\r\n\r\n');
      this.parser.write(serialized);
    });
  });

  describe('request / response cicle', function() {
    beforeEach(function() {
      this.rpc = new RPCStream();
    });

    describe('successful', function() {
      var successResponse = {
        seq: 42,
        type: 'response',
        'request_seq': 1,
        command: 'continue',
        running: true,
        success: true
      };

      it('properly parses events', function(done) {
        var result = this.rpc.execCommand('continue');

        result
          .then(function(res) {
            assert.equal('object', typeof res);
          })
          .nodeify(done);

        this.rpc.write(successResponse);
      });
    });

    describe('failing', function() {
      var errorResponse = {
        seq: 42,
        type: 'response',
        'request_seq': 1,
        command: 'continue',
        running: true,
        success: false,
        message: 'Some reason why'
      };

      it('properly fails with the provided message', function(done) {
        var result = this.rpc.execCommand('continue');

        result
          .nodeify(function(err) {
            assert.equal('Some reason why', err.message);
            done();
          });

        this.rpc.write(errorResponse);
      });
    });
  });
});
