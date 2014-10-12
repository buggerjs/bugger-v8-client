'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var net = require('net');

var Promise = require('bluebird');
var _ = require('lodash');
var debug = require('debug')('bugger-v8-client:debug-client');

var ParseStream = require('./streams/parse');
var RPCStream = require('./streams/rpc');
var SerializeStream = require('./streams/serialize');

var PausedEvent = require('./events/paused');

var knownCommands = require('./commands');

function DebugClient(debugPort) {
  this.debugPort = debugPort;
  this.connected = false;
  this.running = undefined;

  this._parser = null;
  this._rpc = null;
  this._serializer = null;
  this._socket = null;
  this._connecting = null;
}
inherits(DebugClient, EventEmitter);

_.each(knownCommands, function(cmdInit) {
  cmdInit(DebugClient);
});

DebugClient.prototype._onIncoming = function (incoming) {
  var running = incoming.running;
  if (typeof running !== 'boolean')
    return;

  if (running !== this.running) {
    this.running = running;
    this.emit('running', running);
    debug('running: %s (via %s)', running, incoming.command || incoming.event);
  }
};

DebugClient.prototype.triggerPausedEvent =
function triggerPausedEvent(original) {
  var self = this;
  this.backtrace()
    .then(function(trace) {
      var pausedEvent = new PausedEvent(original, trace);
      self.emit('paused', pausedEvent);
    });
};

DebugClient.prototype._onEvent = function(e) {
  debug('Event: %s', e.type);
  var eventType = e.type;
  if (eventType === 'break' || eventType === 'exception') {
    debug('backtrace for paused event');
    this.triggerPausedEvent(e);
  }
  this.emit(e.type, e);
  this.emit('event', e);
};

DebugClient.prototype._sendRequest = function(command, params, cb) {
  debug('_sendRequest %j', command);
  var self = this;
  return this.connect()
    .then(function() {
      return self._rpc.execCommand(command, params).nodeify(cb);
    });
};

DebugClient.prototype._handleConnect = function() {
  this.connected = true;
  this._connecting = null;

  var onEvent = this._onEvent.bind(this);
  var onIncoming = this._onIncoming.bind(this);

  this._socket.once('close', function() {
    this._rpc.removeListener('event', onEvent);
    this._rpc.removeListener('incomingMessage', onIncoming);

    this._rpc.unpipe(this._serializer);
    this._serializer.unpipe(this._socket);

    this._socket.unpipe(this._parser);
    this._parser.unpipe(this._rpc);

    this._rpc = this._parser = this._serializer = null;

    this.connected = false;
    this._connecting = null;
    this.emit('close');
  }.bind(this));

  this._socket.on('error', this.emit.bind(this, 'error'));

  this._parser = new ParseStream();
  this._serializer = new SerializeStream();
  this._rpc = new RPCStream();

  this._rpc.on('event', onEvent);
  this._rpc.on('incomingMessage', onIncoming);

  this._socket.pipe(this._parser).pipe(this._rpc);
  this._rpc.pipe(this._serializer).pipe(this._socket);

  debug('Connected');
  this.emit('connect');
};

DebugClient.prototype.close = function(cb) {
  /*jshint eqnull:true */
  if (cb != null) this.once('close', cb);
  this._socket.end();
};

DebugClient.prototype.nextEvent = function(event) {
  var resolver = Promise.defer();
  debug('Promising: %s', event);
  this.once(event, function(e) {
    debug('nextEvent %s happened', event);
    resolver.resolve(e);
  });
  return this.connect()
    .then(function() { return resolver.promise; });
};

DebugClient.prototype.connect = function(cb) {
  if (this._connecting) {
    return this._connecting;
  } else if (this.connected) {
    return Promise.resolve();
  }

  /*jshint eqnull:true */
  this._connecting = new Promise(function(resolve, reject) {
    debug('Connecting');
    this.once('connect', resolve);

    function tryConnect(retryCount, retryInterval) {
      /*jshint validthis:true */
      debug('Trying to connect to %d', this.debugPort);
      this._socket = net.connect(this.debugPort);

      function retryHandler(err) {
        if (retryCount > 0 && err.code === 'ECONNREFUSED') {
          debug('Retry connect #%d', retryCount);
          setTimeout(
            tryConnect.bind(this, --retryCount, retryInterval),
            retryInterval
          );
        } else {
          this.emit('error', err);
          reject(err);
        }
      }

      this._socket.once('connect', this._handleConnect.bind(this));

      this._socket.once('error', retryHandler.bind(this));
    }

    tryConnect.call(this, 50, 10);

  }.bind(this)).nodeify(cb);

  return this._connecting;
};

module.exports = DebugClient;
