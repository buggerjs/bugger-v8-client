'use strict';

var util = require('util');
var net = require('net');

var Duplex = require('readable-stream').Duplex;
var Bluebird = require('bluebird');
var debug = require('debug')('bugger-v8-client:eternal');

function EternalSocket() {
  if (!(this instanceof EternalSocket)) {
    var args = [null].concat([].slice.call(arguments));
    var Bound = EternalSocket.bind.apply(EternalSocket, args);
    return new Bound();
  }

  this._connectArgs = [].slice.apply(arguments);
  this._socket = null;

  Duplex.call(this);
}
util.inherits(EternalSocket, Duplex);

EternalSocket.prototype.connect = function connect() {
  return this._connectLimit(5);
};

EternalSocket.prototype._connectLimit = function connectLimit(attempts) {
  if (!this._socket) {
    this._socket = this._connectAttempt(attempts);
  }
  return this._socket;
};

EternalSocket.prototype._reconnect = function reconnect() {
  this._socket = null;
  this.connect().done(null, this.emit.bind(this, 'disconnect'));
};

EternalSocket.prototype._connectAttempt = function connectAttempt(attempts) {
  var self = this;
  return new Bluebird(function(resolve, reject) {
    debug('Trying to connect to %j', self._connectArgs);
    var socket = net.connect.apply(net, self._connectArgs);

    function onData(chunk) { self.push(chunk); }

    function closeInnerSocket() {
      debug('Destroying connection to %j', self._connectArgs);
      cleanup();
      socket.on('error', function(err) {
        debug('Error post-connection %j', self._connectArgs, err);
      });
      socket.destroy();
      socket.on('close', function() {
        debug('Destroyed connection to %j', self._connectArgs);
      });
    }

    function onConnect() {
      debug('Connected to %j', self._connectArgs);
      resolve(socket);
    }

    function onError(err) {
      debug('Connection attempt failed to %j', self._connectArgs, err);
      cleanup();

      setTimeout(function() {
        self._socket = null;
        if (err) {
          if (attempts) {
            resolve(self._connectLimit(--attempts));
          } else {
            debug('Giving up on %j', self._connectArgs);
            reject(err);
          }
        } else {
          self.connect();
        }
      }, 75);
    }

    function onClose() {
      debug('Connection lost to %j', self._connectArgs);
      cleanup();
      self._reconnect();
    }

    function setup() {
      socket.on('data', onData);
      self.on('finish', closeInnerSocket);

      socket.on('connect', onConnect);
      socket.on('error', onError);
      socket.on('close', onClose);
    }

    function cleanup() {
      socket.removeListener('data', onData);
      self.removeListener('finish', closeInnerSocket);

      socket.removeListener('connect', onConnect);
      socket.removeListener('error', onError);
      socket.removeListener('close', onClose);
    }

    setup();
  });
};

EternalSocket.prototype._write = function write(raw, encoding, done) {
  function forwardData(socket) {
    socket.write(raw, encoding);
  }
  var self = this;
  this.connect()
    .then(forwardData)
    .catch(function(err) {
      self.emit('disconnect', err);
    })
    .nodeify(done)
};

EternalSocket.prototype._read = function read() {
  // This is ignored, we will always use push when data arrives
  // on the real socket
};

module.exports = EternalSocket;
