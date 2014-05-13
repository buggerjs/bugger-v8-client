'use strict';

var util = require('util');

var Duplex = require('readable-stream').Duplex;
var _ = require('lodash');
var Promise = require('bluebird');

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
  var obj = {
    seq: ++this._lastSequence,
    type: 'request',
    command: command
  };

  if (!_.isEmpty(args)) {
    obj.arguments = args;
  }

  var resolver = this._pending[obj.seq] = Promise.defer();

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
  var resolver = this._pending[seq];
  delete this._pending[seq];
  if (typeof resolver !== 'undefined') {
    if (!raw.success) {
      resolver.reject(new Error(raw.message));
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
