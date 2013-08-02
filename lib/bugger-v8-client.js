
DebugClient = require('./debug-client');

var singletonMap = {};

function createDebugClient(debugPort) {
  if (debugPort == null) debugPort = 5858;
  return new DebugClient(debugPort);
};

function getDebugClient(debugPort) {
  if (debugPort == null) debugPort = 5858;
  if (singletonMap[debugPort] == null) {
    singletonMap[debugPort] = createDebugClient(debugPort);
  }
  return singletonMap[debugPort];
};

module.exports = {
  createDebugClient: createDebugClient,
  getDebugClient: getDebugClient,
  DebugClient: DebugClient
};
