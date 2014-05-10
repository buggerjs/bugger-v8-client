
var expect = require('expect.js');

var DebugParser = require('../../lib/parser');

describe('DebugParser', function() {
  describe('findAfterTwoLineBreaks', function() {
    var findAfterTwoLineBreaks = DebugParser.findAfterTwoLineBreaks;

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
    expect(DebugParser).to.be.a('function');
  });
});
