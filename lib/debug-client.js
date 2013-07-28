
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var net = require('net');

function DebugClient(pid, debugPort) {
  this.pid = pid;
  this.debugPort = debugPort;
};
inherits(DebugClient, EventEmitter);

DebugClient.prototype.connect = function(cb) {
  if (cb != null) this.on('connect', cb);
  var _self = this;

  function tryConnect(retryCount, retryInterval) {
    _self.socket = net.connect(_self.debugPort);

    _self.socket.on('connect', function() {
      _self.emit('connect');
    });

    _self.socket.on('error', function(err) {
      if (retryCount > 0 && err.code === 'ECONNREFUSED') {
        setTimeout(function() {
          tryConnect(--retryCount, retryInterval);
        }, retryInterval);
      } else {
        console.log('error', err);
        _self.emit('error', err);
      }
    });
  };

  tryConnect(50, 10);

  return this;
};

module.exports = DebugClient;
