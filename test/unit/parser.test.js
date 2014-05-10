'use strict';

var expect = require('expect.js');

var ParseStream = require('../../lib/streams/parse');

describe('ParseStream', function() {
  describe('findAfterTwoLineBreaks', function() {
    var findAfterTwoLineBreaks = ParseStream.findAfterTwoLineBreaks;

    it('is a function', function() {
      expect(findAfterTwoLineBreaks).to.be.a('function');
    });

    describe('a string that just contains two line breaks', function() {
      var b = new Buffer('\r\n\r\n');
      it('finds it a position 0, returns 0 + 4', function() {
        expect(findAfterTwoLineBreaks(b)).to.be(4);
      });
    });

    describe('a string that does not contain two line breaks', function() {
      var b = new Buffer('\r\n\r\t');
      it('returns -1', function() {
        expect(findAfterTwoLineBreaks(b)).to.be(-1);
      });
    });

    describe('with something between the line breaks', function() {
      var b = new Buffer('\r\nsomething\r\n');
      it('returns -1', function() {
        expect(findAfterTwoLineBreaks(b)).to.be(-1);
      });
    });

    describe('with something before the line breaks', function() {
      var b = new Buffer('something\r\n\r\n');
      it('returns "something".length + 4', function() {
        expect(findAfterTwoLineBreaks(b)).to.be('something'.length + 4);
      });
    });

    describe('separated by line breaks', function() {
      var b = new Buffer('before\r\n\r\nafter');
      it('can split headers and body', function() {
        var offset = findAfterTwoLineBreaks(b);
        var headers = b.toString('utf8', 0, offset);
        var body = b.toString('utf8', offset);
        expect(headers).to.be('before\r\n\r\n');
        expect(body).to.be('after');
      });
    });
  });

  it('is a function', function() {
    expect(ParseStream).to.be.a('function');
  });

  describe('with a couple of chunks', function() {
    before(function() {
      this.parser = new ParseStream();
    });

    it('emits a "data" event', function(done) {
      var payload = { foo: 2 };
      var json = JSON.stringify(payload);
      // split out to make sure that we side-test concat
      this.parser.write('Some-Header: foo\r\n');
      this.parser.write('Content-Length: 9\r\n');
      this.parser.write('\r\n'); // end of headers
      this.parser.write(json.slice(0, 4));
      this.parser.write(json.slice(4));
      this.parser.on('data', function(raw) {
        expect(raw).to.have.property('foo', 2);
        done();
      });
    });
  });

  describe('without Content-Length header', function() {
    before(function() {
      this.parser = new ParseStream();
    });

    it('emits an "error" event', function(done) {
      var payload = { foo: 2 };
      var json = JSON.stringify(payload);
      this.parser.on('error', function(err) {
        expect(err.message).to.be('Missing Content-Length header');
        done();
      });
      this.parser.write('Some-Header: foo\r\n\r\n');
    });
  });
});
