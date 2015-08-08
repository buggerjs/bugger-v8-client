'use strict';

var net = require('net');

var Bluebird = require('bluebird');

var lastDebugPort = 5860;

function waitForPaused(client) {
  return client._sendRequest('version')
    .then(function() {
      if (client.running === false) {
        return Bluebird.resolve();
      }
      return client.nextEvent('paused');
    });
}

function ensureAvailable(port) {
  return new Bluebird(function(resolve, reject) {
    var socket = net.connect(port);
    socket.on('error', function(err) {
      if (err.code === 'ECONNREFUSED') {
        resolve();
      } else {
        reject(err);
      }
    });
    socket.on('connect', function() {
      reject(new Error('Something already listening on ' + port));
    });
  });
}

module.exports = function withBugger(name, args, debugBreak) {
  if (!Array.isArray(args)) { args = []; }
  if (typeof debugBreak === 'undefined') debugBreak = true;

  var debugPrefix = debugBreak ? '--debug-brk=' : '--debug=';

  var execFile = require('child_process').execFile;
  var path = require('path');

  var createDebugClient = (
    require('../../lib/bugger-v8-client').createDebugClient
  );

  var rootDir = path.join(__dirname, '..', '..');
  var filename = path.join(rootDir, 'example', name);

  beforeEach('launch child & connect', function(done) {
    var self = this;
    // cleanup
    self.child = null;
    self.bugger = null;
    self.debugPort = (++lastDebugPort);

    ensureAvailable(self.debugPort)
      .done(function() {
        var withNodeArgs = [
          debugPrefix + self.debugPort,
          filename
        ].concat(args);
        self.child = execFile(process.argv[0], withNodeArgs, {
          cwd: process.cwd(), env: process.env
        });

        if (process.env.BUGGER_PIPE_CHILD) {
          self.child.stdout.pipe(process.stdout);
          self.child.stderr.pipe(process.stderr);
        }

        setTimeout(function() {
          self.bugger = createDebugClient(lastDebugPort);

          if (debugBreak) {
            waitForPaused(self.bugger).nodeify(done);
          } else {
            done();
          }
        }, 250);
      }, done);
  });

  afterEach('close bugger & child', function(done) {
    if (this.bugger) {
      this.bugger.close();
    }

    if (!this.child || !this.child.pid) {
      return done();
    }
    
    if (this.child.connected) {
      this.child.on('exit', function() { done(); });
    } else {
      setTimeout(done, 150);
    }
    process.kill(this.child.pid);
  });
};
