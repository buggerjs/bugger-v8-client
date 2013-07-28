
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var net = require('net');

var debugParser = require('./parser');

function callbackMarshal(startSeq) {
  var lastSeq = startSeq;
  var callbackBySeq = {};

  function toSequence(cb) {
    callbackBySeq[++lastSeq] = cb;
    return lastSeq;
  }

  function fromSequence(seq) {
    var cb = callbackBySeq[seq];
    // don't wanna leak that memory.
    delete callbackBySeq[seq];
    return cb;
  }

  return {
    toSequence: toSequence, fromSequence: fromSequence
  };
};

function DebugClient(pid, debugPort) {
  this.pid = pid;
  this.debugPort = debugPort;
  this.connected = false;
  this.running = false;

  this._cbMarshal = callbackMarshal(5000);

  var _parseMessage = (function (message, cb) {
    if (message.running != null) this.updateRunning(message.running);

    var refMap = {};
    if (Array.isArray(message.refs)) {
      message.refs.forEach(function(ref) {
        ref.handle = ref.handle.toString();
        refMap[ref.handle] = ref;
      });
    }

    return cb(
      message.success === false ? new Error(message.message) : null,
      message.body, refMap
    );
  }).bind(this);

  this._onResponse = (function(res) {
    var cb = this._cbMarshal.fromSequence(res.request_seq);
    if ('function' !== typeof cb) return;
    return _parseMessage(res, cb);
  }).bind(this);

  this._onEvent = (function(message) {
    var _self = this;
    var event = message.event;
    return _parseMessage(message, function(err, body, refMap) {
      if (err != null) return _self.emit('error', err);
      return _self.emit(event, body, refMap);
    });
  }).bind(this);
};
inherits(DebugClient, EventEmitter);

DebugClient.prototype.updateRunning = function(running) {
  running = !!running;
  if (running !== this.running) {
    this.running = running;
    eventName = running ? 'running' : 'stopped';
    this.emit(eventName);
  }
};

DebugClient.prototype.write = function(data) {
  if (this.socket.writable) {
    this.socket.write("Content-Length: " + data.length + "\r\n\r\n");
    return this.socket.write(data);
  } else {
    return this.emit('error', new Error('Debug connection not writable'));
  }
};

DebugClient.prototype._sendRequest = function(command, params, cb) {
  var message = {
    type: 'request',
    command: command,
    seq: this._cbMarshal.toSequence(cb)
  };

  if (Object.keys(params).length > 0) {
    message.arguments = params;
  }

  return this.write(JSON.stringify(message));
};

DebugClient.prototype._handleConnect = function() {
  this.connected = true;

  this.socket.once('close', (function() {
    this._parser.removeListener('parsed:response', this._onResponse);
    this._parser.removeListener('parsed:event', this._onEvent);
    this.connected = false;
    this.emit('close');
  }).bind(this));

  this.socket.on('error', (function(err) {
    this.emit('error', err);
  }).bind(this));

  this._parser = debugParser(this.socket);
  this._parser.on('parsed:response', this._onResponse);
  this._parser.on('parsed:event', this._onEvent);

  this.emit('connect');
};

DebugClient.prototype.close = function(cb) {
  if (cb != null) this.once('close', cb);
  this.socket.end();
};

DebugClient.prototype.connect = function(cb) {
  if (cb != null) this.once('connect', cb);
  var _self = this;

  function tryConnect(retryCount, retryInterval) {
    _self.socket = net.connect(_self.debugPort);

    retryHandler = function(err) {
      if (retryCount > 0 && err.code === 'ECONNREFUSED') {
        setTimeout(function() {
          tryConnect(--retryCount, retryInterval);
        }, retryInterval);
      } else {
        _self.emit('error', err);
      }
    };

    _self.socket.once('connect', function() {
      _self._handleConnect();
    });

    _self.socket.once('error', retryHandler);
  };

  tryConnect(50, 10);

  return this;
};

module.exports = DebugClient;
