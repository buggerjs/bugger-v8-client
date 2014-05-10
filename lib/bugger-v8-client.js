
DebugClient = require('./debug-client');

var singletonMap = {};

function createDebugClient(pid, debugPort) {
  if (debugPort == null) debugPort = 5858;
  return new DebugClient(pid, debugPort);
};

function getDebugClient(pid, debugPort) {
  pid = +pid;
  debugPort = +debugPort;

  if (singletonMap[pid] == null) {
    return singletonMap[pid];
  } else {
    return singletonMap[pid] = createDebugClient(pid, debugPort);
  }
};

module.exports = {
  createDebugClient: createDebugClient,
  getDebugClient: getDebugClient,
  DebugClient: DebugClient
};
