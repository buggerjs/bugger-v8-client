
DebugClient = require('./debug-client');

var singletonMap = {};

function createDebugClient(pid, debugPort) {
  if (debugPort == null) debugPort = 5858;
  return new DebugClient(pid, debugPort);
};

function getDebugClient(pid, debugPort) {
  if (debugPort == null) debugPort = 5858;
  if (singletonMap[debugPort] == null) {
    singletonMap[debugPort] = createDebugClient(pid, debugPort);
  }
  return singletonMap[debugPort];
};

module.exports = {
  createDebugClient: createDebugClient,
  getDebugClient: getDebugClient,
  DebugClient: DebugClient
};
