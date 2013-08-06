
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var fromV8Type = require('./types').fromV8Type;

var debugParser = require('./parser');

var knownCommands = [
  'backtrace', 'setexceptionbreak', 'resume', 'scripts',
  'setbreakpoint', 'clearbreakpoint', 'evaluate', 'pause',
  'scopeproperties', 'properties'
];

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

function DebugClient(debugPort) {
  this.debugPort = debugPort;
  this.connected = false;
  this.running = false;

  this._cbMarshal = callbackMarshal(5000);
};
inherits(DebugClient, EventEmitter);

knownCommands.forEach(function(cmd) {
  DebugClient.prototype[cmd] = require('./commands/' + cmd);
});

DebugClient.prototype.updateRunning = function(running) {
  running = !!running;
  if (running !== this.running) {
    this.running = running;
    eventName = running ? 'running' : 'stopped';
    this.emit(eventName);
  }
};

DebugClient.prototype._prepareIncoming = function (incoming, cb) {
  if (incoming.running != null) this.updateRunning(incoming.running);

  var refMap = {};
  if (Array.isArray(incoming.refs)) {
    incoming.refs.forEach(function(ref) {
      ref.handle = ref.handle.toString();
      refMap[ref.handle] = ref;
    });
  }

  return cb(
    incoming.success === false ? new Error(incoming.message) : null,
    incoming.body, refMap
  );
};

DebugClient.prototype._onResponse = function(res) {
  var cb = this._cbMarshal.fromSequence(res.request_seq);
  if ('function' !== typeof cb) return;
  return this._prepareIncoming(res, cb);
};

DebugClient.prototype._onEvent = function(eventData) {
  var event = eventData.event, _self = this;
  return this._prepareIncoming(eventData, function(err, body, refMap) {
    if (err != null) return _self.emit('error', err);
    if (event === 'break' || event === 'exception') {
      _self.backtrace(function(err, breakEvent) {
        breakEvent.reason = event;
        _self.emit('paused', breakEvent);
      });
    } else if (event === 'afterCompile') {
      var scriptObj = fromV8Type(body.script, refMap);
      _self.emit('scriptParsed', scriptObj);
    }
    return _self.emit(event, body, refMap);
  });
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

  if (params != null && Object.keys(params).length > 0) {
    message.arguments = params;
  }

  return this.write(JSON.stringify(message));
};

DebugClient.prototype._handleConnect = function() {
  this.connected = true;

  var onResponse = this._onResponse.bind(this);
  var onEvent = this._onEvent.bind(this);

  this.socket.once('close', (function() {
    this._parser.removeListener('parsed:response', onResponse);
    this._parser.removeListener('parsed:event', onEvent);
    this.connected = false;
    this.emit('close');
  }).bind(this));

  this.socket.on('error', this.emit.bind(this, 'error'));

  this._parser = debugParser(this.socket);
  this._parser.on('parsed:response', onResponse);
  this._parser.on('parsed:event', onEvent);

  this.emit('connect');
};

DebugClient.prototype.close = function(cb) {
  if (cb != null) this.once('close', cb);
  this.socket.end();
};

DebugClient.prototype.connect = function(cb) {
  if (this.connected) {
    if (cb != null) process.nextTick(cb);
    return;
  }
  if (cb != null) this.once('connect', cb);

  function tryConnect(retryCount, retryInterval) {
    this.socket = net.connect(this.debugPort);

    retryHandler = function(err) {
      if (retryCount > 0 && err.code === 'ECONNREFUSED') {
        setTimeout(
          tryConnect.bind(this, --retryCount, retryInterval),
          retryInterval
        );
      } else {
        this.emit('error', err);
      }
    };

    this.socket.once('connect', this._handleConnect.bind(this));

    this.socket.once('error', retryHandler.bind(this));
  };

  tryConnect.call(this, 50, 10);

  return this;
};

module.exports = DebugClient;
