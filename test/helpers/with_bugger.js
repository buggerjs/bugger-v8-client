'use strict';

var lastDebugPort = 5858;

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
  var filename = path.join(rootDir, 'test', 'buggers', name);

  beforeEach(function(done) {
    // cleanup
    this.child = null;
    this.bugger = null;
    this.debugPort = (++lastDebugPort);

    var withNodeArgs = [
      debugPrefix + this.debugPort,
      filename
    ].concat(args);
    this.child = execFile(process.argv[0], withNodeArgs, {
      cwd: process.cwd(), env: process.env
    });

    if (process.env.BUGGER_PIPE_CHILD) {
      this.child.stdout.pipe(process.stdout);
    }
    this.bugger = createDebugClient(this.child.pid, lastDebugPort);
    done();
  });

  afterEach(function(done) {
    if (this.bugger.connected) {
      this.bugger.on('close', function() { done(); });
    } else {
      this.child.on('exit', function() { done(); });
    }
    this.child.kill();
  });
};
