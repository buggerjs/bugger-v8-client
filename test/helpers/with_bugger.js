var lastDebugPort = 5858;

module.exports = function withBugger(name, args, debugBreak) {
  if (!Array.isArray(args)) { args = []; }
  if (debugBreak == null) debugBreak = true;

  var debugPrefix = debugBreak ? '--debug-brk=' : '--debug=';

  var execFile = require('child_process').execFile;
  var path = require('path');

  var createDebugClient = require('../../lib/bugger-v8-client').createDebugClient;

  var rootDir = path.join(__dirname, '..', '..')
  var filename = path.join(rootDir, 'test', 'buggers', name);
  var ctx = {
    debugPort: -1,
    child: null,
    bugger: null
  };

  beforeEach(function(done) {
    // cleanup
    ctx.child = null;
    ctx.bugger = null;
    ctx.debugPort = (++lastDebugPort);

    var withNodeArgs = [
      debugPrefix + ctx.debugPort,
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
  });

  return ctx;
};
