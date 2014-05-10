'use strict';

var Transform = require('readable-stream').Transform;
var util = require('util');


function SerializeStream() {
  if (!this instanceof SerializeStream)
    return new SerializeStream();

  Transform.call(this);
  this._writableState.objectMode = true;
}
util.inherits(SerializeStream, Transform);


SerializeStream.prototype._transform = function (chunk, encoding, done) {
  var body = new Buffer(JSON.stringify(chunk), 'utf8');
  var headers = new Buffer(
    'Content-Length: ' + body.length + '\r\n\r\n'
  );
  this.push(headers);
  this.push(body);
  done();
};

module.exports = SerializeStream;
