'use strict';

var test = require('blue-tape');

var ParseStream = require('../../lib/streams/parse');

test('ParseStream', function(t) {
  t.test('couple of chunks => "data" event', function(t) {
    var parser = new ParseStream();

    var payload = { foo: 2 };
    var json = JSON.stringify(payload);
    // split out to make sure that we side-test concat
    parser.write('Some-Header: a-header-value\r\n');
    parser.write('Content-Length: 9\r\n');
    parser.write('\r\n'); // end of headers
    parser.write(json.slice(0, 4));
    parser.write(json.slice(4));
    parser.on('data', function(data) {
      t.deepEqual(data, payload, 'data == original payload');
      t.end();
    });
  });

  t.test('no Content-Length => "error" event', function(t) {
    var parser = new ParseStream();

    var payload = { foo: 2 };
    var json = JSON.stringify(payload);
    parser.on('error', function(err) {
      t.equal(err.message, 'Missing Content-Length header', 'Correct error message');
      t.end();
    });
    parser.write('Some-Header: foo\r\n\r\n');
  });

  t.end();
});

test('ParseStream.findAfterTwoLineBreaks', function(t) {
  var findAfterTwoLineBreaks = ParseStream.findAfterTwoLineBreaks;

  t.equal(4, findAfterTwoLineBreaks(new Buffer('\r\n\r\n')),
    'just two line breaks -> match at position 0, returns 0 + 4');

  t.equal(-1, findAfterTwoLineBreaks(new Buffer('\r\n\r\t')),
    'no two line breaks -> returns -1 (not found)');

  t.equal(-1, findAfterTwoLineBreaks(new Buffer('\r\nsomething\r\n')),
    'two line breaks, not contiguous -> returns -1 (not found)');

  t.equal('something'.length + 4, findAfterTwoLineBreaks(new Buffer('something\r\n\r\n')),
    'with "something" before the line breaks -> "something".length + 4');

  t.test('splitting headers and body, separated by two line breaks', function(t) {
    var b = new Buffer('before\r\n\r\nafter');
    var offset = findAfterTwoLineBreaks(b);
    var headers = b.toString('utf8', 0, offset);
    var body = b.toString('utf8', offset);

    t.equal(headers, 'before\r\n\r\n', 'headers are everything up to and including the line breaks');
    t.equal(body, 'after', 'body is the rest');
    t.end();
  });

  t.end();
});
