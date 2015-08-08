'use strict';

var execFile = require('child_process').execFile;
var path = require('path');
var net = require('net');

var test = require('blue-tape');
var Bluebird = require('bluebird');
var async = Bluebird.coroutine;
var _ = require('lodash');

var createDebugClient = require('../..').createDebugClient;

var ROOT_DIR = path.join(__dirname, '..', '..');
var lastDebugPort = 5860;

function waitForPaused(bugger) {
  return bugger._sendRequest('version')
    .then(function() {
      if (bugger.running === false) {
        return Bluebird.resolve(bugger);
      }
      return bugger.nextEvent('paused')
        .then(function() { return bugger; });
    });
}

function ensureAvailable(port) {
  return new Bluebird(function(resolve, reject) {
    var socket = net.connect(port);
    socket.on('error', function(err) {
      return err.code === 'ECONNREFUSED' ? resolve() : reject(err);
    });
    socket.on('connect', function() {
      reject(new Error('Something already listening on ' + port));
    });
  });
}

function launchAndConnect(ctx, name, args, debugBreak, debugPort) {
  var debugPrefix = debugBreak ? '--debug-brk=' : '--debug=';
  var filename = path.join(ROOT_DIR, 'example', name);

  var withNodeArgs = [ debugPrefix + debugPort, filename ].concat(args);

  function launch() {
    var child = ctx.child = execFile(process.argv[0], withNodeArgs, {
      cwd: process.cwd(), env: process.env
    });

    if (process.env.BUGGER_PIPE_CHILD) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }
    return child;
  }

  function connect() {
    var bugger = ctx.bugger = createDebugClient(debugPort);
    return debugBreak ? waitForPaused(bugger) : bugger;
  }

  return ensureAvailable(debugPort)
    .then(function() {
      return Bluebird.all([ launch(), Bluebird.delay(250).then(connect) ]);
    });
}

function killAndDisconnect(child, bugger) {
  if (bugger) { bugger.close(); }

  if (!child || !child.pid) { return; }
  
  process.kill(child.pid);
  if (child.connected) {
    return new Bluebird(function(resolve) {
      child.on('exit', resolve);
    });
  }
  return Bluebird.delay(150);
}

test.Test.prototype.buggerTest = function buggerTest(name, args, debugBreak, f) {
  if (typeof args === 'function') {
    f = args; args = []; debugBreak = true;
  } else if (typeof debugBreak === 'function') {
    f = debugBreak; debugBreak = true;
  }

  return this.test('w/ script: ' + name, function(t) {
    var ctx = {};
    var debugPort = ++lastDebugPort;
    return launchAndConnect(ctx, name, args, debugBreak, debugPort)
      .then(function() {
        return f(t, ctx.bugger, ctx.child, debugPort);
      })
      .finally(function() {
        return killAndDisconnect(ctx.child, ctx.bugger);
      });
  });
};
