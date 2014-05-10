'use strict';

var Transform = require('readable-stream').Transform;
var util = require('util');


function DebugParser() {
  if (!this instanceof DebugParser)
    return new DebugParser();

  Transform.call(this);
  this._readableState.objectMode = true;

  this._buffer = new Buffer('');

  this._contentLength = 0;
  this._headers = null;
}
util.inherits(DebugParser, Transform);


DebugParser.prototype._transform = function (chunk, encoding, done) {
  var madeProgress = true;

  this._buffer = Buffer.concat([ this._buffer, chunk ]);
  while (madeProgress) {
    madeProgress = (
      this._headers === null ?
      this._parseHeaders() : this._parseBody()
    );
  }
  done();
};


function findAfterTwoLineBreaks(buffer) {
  var idx = 0, found = 0;
  for (idx = 0; idx < buffer.length; ++idx) {
    switch (found) {
      case 0:
      case 2:
        if (buffer[idx] === 13) { // \r
          ++found;
        } else {
          found = 0;
        }
        break;
      case 1:
      case 3:
        if (buffer[idx] === 10) { // \n
          ++found;
        } else {
          found = 0;
        }
        break;
    }
    if (found === 4) {
      // first position after the line breaks
      return idx + 1;
    }
  }
  return -1;
}
DebugParser.findAfterTwoLineBreaks = findAfterTwoLineBreaks;


var LENGTH_HEADER = /Content-Length: (\d+)/;
DebugParser.prototype.setHeaders = function (headers) {
  this._headers = headers;
  var match = LENGTH_HEADER.exec(headers);
  this._contentLength = (
    match !== null ?
      parseInt(match[1], 10)
    : NaN
  );
};


DebugParser.prototype._parseHeaders = function () {
  var offset = findAfterTwoLineBreaks(this._buffer);
  if (offset === -1) return false;

  this.setHeaders(this._buffer.toString('utf8', 0, offset));

  if(isNaN(this._contentLength)) {
    this.emit('error', new Error('Missing Content-Length header'));
  }

  this._buffer = this._buffer.slice(offset);
  return true;
};


DebugParser.prototype._parseBody = function () {
  var buffer = this._buffer;
  var contentLength = this._contentLength;
  if (buffer.length < contentLength)
    return false;

  // All the body is here - let's parse it.
  var body = buffer.toString('utf8', 0, contentLength);
  this._buffer = buffer.slice(contentLength);

  if (body.length > 0) {
    try {
      var raw = JSON.parse(body);
      this.emit('parsed:' + raw.type, raw);
      this.push(raw);
    } catch (error) {
      this.emit('error', error);
    }
  }

  this._contentLength = 0;
  this._headers = null;
  return true;
};

module.exports = DebugParser;
