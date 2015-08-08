'use strict';

import test from 'blue-tape';

import RPCStream from '../../lib/streams/rpc';
import ParseStream from '../../lib/streams/parse';

const rawBreakEvent = {
  type: 'event',
  event: 'break',
  running: false,
  body: {
    invocationText: 'foo',
    script: {}
  }
};

function unexpected(value) {
  throw new Error('Unexpected promise resolve: ' + value);
}

test('RPCStream', t => {
  t.test('writing an event object', t => {
    const rpc = new RPCStream();
    rpc.on('break', breakEvent => {
      t.equal('object', typeof breakEvent.location.script,
        'maps to break event');
      t.end();
    });
    rpc.write(rawBreakEvent);
  });

  t.test('together with parser', t => {
    const parser = new ParseStream();
    const rpc = new RPCStream();
    parser.pipe(rpc);

    rpc.on('break', breakEvent => {
      t.equal('object', typeof breakEvent.location.script,
        'maps to break event');
      t.end();
    });
    const serialized = JSON.stringify(rawBreakEvent);
    parser.write('Content-Length: ' + serialized.length);
    parser.write('\r\n\r\n');
    parser.write(serialized);
  });

  t.test('request / response cicle', t => {
    t.test('successful', t => {
      const rpc = new RPCStream();
      const successResponse = {
        seq: 42,
        type: 'response',
        'request_seq': 1,
        command: 'continue',
        running: true,
        success: true
      };

      const result = rpc.execCommand('continue')
        .then(res => {
          t.equal('object', typeof res, 'properly parses events');
        });

      rpc.write(successResponse);
      return result;
    });

    t.test('failing', t => {
      const rpc = new RPCStream();
      const errorResponse = {
        seq: 42,
        type: 'response',
        'request_seq': 1,
        command: 'continue',
        running: true,
        success: false,
        message: 'Some reason why'
      };

      const result = rpc.execCommand('continue')
        .then(unexpected, err => {
          t.equal(err.message, 'Some reason why',
            'properly fails with the provided message');
        });

      rpc.write(errorResponse);
      return result;
    });

    t.end();
  });
});
