'use strict';

var test = require('blue-tape');

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

function unexpected(value) {
  throw new Error('Unexpected promise resolve: ' + value)
}

test('RPCStream', function(t) {
  t.test('writing an event object', function(t) {
    var rpc = new RPCStream();
    rpc.on('break', function(breakEvent) {
      t.equal('object', typeof breakEvent.location.script,
        'maps to break event');
      t.end();
    });
    rpc.write(rawBreakEvent);
  });

  t.test('together with parser', function(t) {
    var parser = new ParseStream();
    var rpc = new RPCStream();
    parser.pipe(rpc);

    rpc.on('break', function(breakEvent) {
      t.equal('object', typeof breakEvent.location.script,
        'maps to break event');
      t.end();
    });
    var serialized = JSON.stringify(rawBreakEvent);
    parser.write('Content-Length: ' + serialized.length);
    parser.write('\r\n\r\n');
    parser.write(serialized);
  });

  t.test('request / response cicle', function(t) {
    t.test('successful', function(t) {
      var rpc = new RPCStream();
      var successResponse = {
        seq: 42,
        type: 'response',
        'request_seq': 1,
        command: 'continue',
        running: true,
        success: true
      };

      var result = rpc.execCommand('continue')
        .then(function(res) {
          t.equal('object', typeof res, 'properly parses events');
        });

      rpc.write(successResponse);
      return result;
    });

    t.test('failing', function(t) {
      var rpc = new RPCStream();
      var errorResponse = {
        seq: 42,
        type: 'response',
        'request_seq': 1,
        command: 'continue',
        running: true,
        success: false,
        message: 'Some reason why'
      };

      var result = rpc.execCommand('continue')
        .then(unexpected, function(err) {
          t.equal(err.message, 'Some reason why',
            'properly fails with the provided message');
        });

      rpc.write(errorResponse);
      return result;
    });

    t.end();
  });
});
