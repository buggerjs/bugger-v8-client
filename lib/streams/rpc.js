'use strict';

var util = require('util');

var Duplex = require('readable-stream').Duplex;
var Promise = require('bluebird');
var debug = require('debug')('bugger-v8-client:rpc');

var createEvent = require('../events');


function RPCStream() {
  if (!this instanceof RPCStream)
    return new RPCStream();

  Duplex.call(this, { objectMode: true });

  this._lastSequence = 0;
  this._pending = {};
}
util.inherits(RPCStream, Duplex);


RPCStream.prototype.execCommand = function(command, args) {
  var seq = ++this._lastSequence;
  var obj = {
    seq: seq,
    type: 'request',
    command: command,
    arguments: args
  };
  debug('[%s] request %j', seq, command);

  var resolver = this._pending[seq] = Promise.defer();
  resolver.requestArguments = args;

  this.push(obj);
  this.emit('readable');

  return resolver.promise;
};


RPCStream.prototype._processEventMessage = function(raw) {
  var event = createEvent(raw);
  this.emit(raw.event, event);
  this.emit('event', event);
};


RPCStream.prototype._processResponseMessage = function(raw) {
  /*jshint camelcase:false */

  var seq = raw.request_seq;
  debug('[%s] response %j', seq, raw.command);
  var resolver = this._pending[seq];
  delete this._pending[seq];
  if (typeof resolver !== 'undefined') {
    if (!raw.success) {
      var err = new Error(raw.message);
      err.args = resolver.requestArguments;
      resolver.reject(err);
    } else {
      resolver.resolve(raw);
    }
  }
};


// Messages coming from the ParseStream
RPCStream.prototype._write = function (raw, encoding, done) {
  /*jslint unparam: true*/
  this.emit('incomingMessage', raw);

  switch (raw.type) {
    case 'event':
      this._processEventMessage(raw);
      break;

    case 'response':
      this._processResponseMessage(raw);
      break;
  }
  done();
};


// Messages going out to the SerializeStream
RPCStream.prototype._read = function () {
  // This is ignored, we will always use push when someone tries
  // to send a new message
};

module.exports = RPCStream;
