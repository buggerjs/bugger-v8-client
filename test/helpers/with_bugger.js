var lastDebugPort = 5858;

module.exports = function withBugger(name, args) {
  var execFile = require('child_process').execFile;
  var path = require('path');

  var createDebugClient = require('../../lib/bugger-v8-client').createDebugClient;

  var rootDir = path.join(__dirname, '..', '..')
  var filename = path.join(rootDir, 'test', 'buggers', name);
  var ctx = {
    debugPort: (++lastDebugPort),
    child: null,
    bugger: null
  };

  if (!Array.isArray(args)) { args = []; }

  beforeEach(function(done) {
    var withNodeArgs = [
      '--debug-brk=' + ctx.debugPort,
      filename
    ].concat(args);
    ctx.child = execFile(process.argv[0], withNodeArgs, {
      cwd: process.cwd(), env: process.env
    });
    ctx.bugger = createDebugClient(ctx.child.pid, lastDebugPort);
    done();
  });

  afterEach(function(done) {
    if (ctx.bugger.connected) {
      ctx.bugger.on('close', function() { done(); });
    } else {
      ctx.child.on('exit', function() { done(); });
    }
    ctx.child.kill();

    // cleanup
    ctx.child = null;
    ctx.bugger = null;
    ctx.debugPort = (++lastDebugPort);
  });

  return ctx;
};
