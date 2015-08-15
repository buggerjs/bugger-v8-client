'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;

var Promise = require('bluebird');
var _ = require('lodash');
var debug = require('debug')('bugger-v8-client:debug-client');

var ParseStream = require('./streams/parse');
var RPCStream = require('./streams/rpc');
var SerializeStream = require('./streams/serialize');

var PausedEvent = require('./events/paused');

var knownCommands = require('./commands');

function DebugClient(socket) {
  this.running = undefined;
  this._socket = socket;

  this._wireStreams();
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
      var pausedEvent = new PausedEvent(original, trace.callFrames);
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
  return this._rpc.execCommand(command, params).nodeify(cb);
};

DebugClient.prototype._wireStreams = function() {
  var onEvent = this._onEvent.bind(this);
  var onIncoming = this._onIncoming.bind(this);

  this._socket.once('close', function() {
    debug('DebugClient#close');
    this._rpc.removeListener('event', onEvent);
    this._rpc.removeListener('incomingMessage', onIncoming);

    this._rpc.unpipe(this._serializer);
    this._serializer.unpipe(this._socket);

    this._socket.unpipe(this._parser);
    this._parser.unpipe(this._rpc);

    this._rpc = this._parser = this._serializer = null;

    this.emit('close');
  }.bind(this));

  this._socket.on('disconnect', this.emit.bind(this, 'error'));
  this._socket.on('error', this.emit.bind(this, 'error'));
  this._socket.on('error', function(err) {
    console.trace('This should never happen');
  });

  this._parser = new ParseStream();
  this._serializer = new SerializeStream();
  this._rpc = new RPCStream();

  this._rpc.on('event', onEvent);
  this._rpc.on('incomingMessage', onIncoming);

  this._socket.pipe(this._parser).pipe(this._rpc);
  this._rpc.pipe(this._serializer).pipe(this._socket);
};

DebugClient.prototype.close = function(cb) {
  /*jshint eqnull:true */
  if (cb != null) this.once('close', cb);
  this._socket.end();
};

DebugClient.prototype.nextEvent = function(event) {
  var self = this;
  return new Promise(function(resolve, reject) {
    debug('Waiting for event %j', event)
    self.once(event, resolve);
    self.connect().done(null, reject);
  });
};

DebugClient.prototype.connect = function(cb) {
  return this._socket.connect().nodeify(cb);
}

module.exports = DebugClient;
