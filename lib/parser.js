var EventEmitter = require('events').EventEmitter;

var LENGTH_HEADER = /Content-Length: (\d+)/;

module.exports = function debugParser(stream) {
  function emptyMessage() {
    return { headers: null, contentLength: 0 };
  }

  var _buffer = '';
  var _parser = new EventEmitter();
  var _currentMessage = emptyMessage();

  function parseContentLength() {
    var match = /Content-Length: (\d+)/.exec(_currentMessage.headers);
    if (match != null) return parseInt(match[1], 10);
    return null;
  }

  function parseHeaders() {
    var offset = _buffer.indexOf('\r\n\r\n');
    if (offset < 1) return false;
    _currentMessage.headers = _buffer.substr(0, offset + 4);

    var contentLength = parseContentLength();
    if(contentLength != null) {
      _currentMessage.contentLength = contentLength;
    } else {
      _parser.emit('error', new Error('No Content-Length'));
    }

    _buffer = _buffer.substr(offset + 4);
    return true;
  }

  function parseBody() {
    var contentLength = _currentMessage.contentLength;
    if (Buffer.byteLength(_buffer) < contentLength) return false;

    // All the body is here - let's parse it.
    var b = new Buffer(_buffer);
    var body = b.toString('utf8', 0, _currentMessage.contentLength);
    _buffer = b.toString('utf8', _currentMessage.contentLength, b.length);

    if (body.length > 0) {
      try {
        var obj = JSON.parse(body);
        _parser.emit('parsed:' + obj.type, obj);
      } catch (error) {
        _parser.emit('error', error);
      }
    }

    _currentMessage = emptyMessage();
    return true;
  }

  function continueParsing() {
    var madeProgress = true;
    while (madeProgress) {
      madeProgress = (
        _currentMessage.headers == null ?
        parseHeaders() : parseBody()
      );
    }
  }

  stream.on('data', function(chunk) {
    _buffer += chunk;
    continueParsing();
  });

  return _parser;
};
