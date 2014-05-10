'use strict';

var DebugClient = require('./debug-client');

var singletonMap = {};

function createDebugClient(pid, debugPort) {
  debugPort = +debugPort;
  if (isNaN(debugPort)) debugPort = 5858;
  return new DebugClient(pid, debugPort);
}

function getDebugClient(pid, debugPort) {
  pid = +pid;
  debugPort = +debugPort;

  if (!singletonMap[debugPort]) {
    singletonMap[debugPort] = createDebugClient(pid, debugPort);
  } else if (singletonMap[debugPort].pid !== pid) {
    throw new Error('Attempted to reuse debug port: ' + debugPort);
  }
  return singletonMap[debugPort];
}

module.exports = {
  createDebugClient: createDebugClient,
  getDebugClient: getDebugClient,
  DebugClient: DebugClient
};
