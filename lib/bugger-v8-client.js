'use strict';

var DebugClient = require('./debug-client');
var EternalSocket = require('./streams/eternal');

var singletonMap = {};

function createDebugClient(debugPort) {
  debugPort = +debugPort;
  if (isNaN(debugPort)) debugPort = 5858;
  return new DebugClient(new EternalSocket(debugPort));
}

function getDebugClient(debugPort) {
  debugPort = +debugPort;

  if (!singletonMap[debugPort]) {
    singletonMap[debugPort] = createDebugClient(debugPort);
  }
  return singletonMap[debugPort];
}

function attachDebugClient(pid, debugPort) {
  // allow passing in process instances
  if (pid.pid) pid = +pid.pid;
  else pid = +pid;

  if (debugPort === undefined) debugPort = 5858;
  else debugPort = +debugPort;

  process.kill(pid, 'SIGUSR1');
  var client = getDebugClient(debugPort);
  return client;
}

module.exports = {
  createDebugClient: createDebugClient,
  getDebugClient: getDebugClient,
  attachDebugClient: attachDebugClient,
  DebugClient: DebugClient
};
