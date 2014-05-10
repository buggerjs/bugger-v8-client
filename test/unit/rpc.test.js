
var expect = require('expect.js');

var RPCStream = require('../../lib/streams/rpc');
var ParseStream = require('../../lib/streams/parse');

var rawBreakEvent = {
  type: 'event',
  event: 'break',
  running: false,
  body: {
    invocationText: 'foo'
  }
};

describe('RPCStream', function() {
  it('is a function', function() {
    expect(RPCStream).to.be.a('function');
  });

  describe('when writing an event object', function() {
    before(function() {
      this.rpc = new RPCStream();
    });

    it('emits a matching event', function(done) {
      this.rpc.on('break', function(breakEvent) {
        expect(breakEvent.running).to.be(false);
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
        expect(breakEvent.running).to.be(false);
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
        request_seq: 1,
        command: 'continue',
        running: true,
        success: true
      };

      it('properly parses events', function(done) {
        var result = this.rpc.execCommand('continue');

        result
          .then(function(res) {
            expect(res).to.be.an('object');
          })
          .nodeify(done);

        this.rpc.write(successResponse);
      });
    });

    describe('failing', function() {
      var errorResponse = {
        seq: 42,
        type: 'response',
        request_seq: 1,
        command: 'continue',
        running: true,
        success: false,
        message: 'Some reason why'
      };

      it('properly fails with the provided message', function(done) {
        var result = this.rpc.execCommand('continue');

        result
          .nodeify(function(err) {
            expect(err.message).to.be('Some reason why');
            done();
          });

        this.rpc.write(errorResponse);
      });
    });
  });
});
