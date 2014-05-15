#!/usr/bin/env node
'use strict';

function withBugger(filename, args, debugBreak) {
  if (!Array.isArray(args)) { args = []; }
  if (typeof debugBreak === 'undefined') debugBreak = true;

  var debugPrefix = debugBreak ? '--debug-brk=' : '--debug=';

  var execFile = require('child_process').execFile;

  var createDebugClient = (
    require('../lib/bugger-v8-client').createDebugClient
  );

  var debugPort = 5858;

  var withNodeArgs = [
    debugPrefix + debugPort,
    filename
  ].concat(args);

  var child = execFile(process.argv[0], withNodeArgs, {
    cwd: process.cwd(), env: process.env
  });

  child.on('exit', function(exitCode) {
    console.log('Child died:', exitCode);
    process.exit(exitCode);
  });

  if (process.env.BUGGER_PIPE_STDOUT) {
    child.stdout.pipe(process.stdout);
  }

  process.on('exit', function() {
    try { child.kill(); } catch (e) {}
  });

  return createDebugClient(child.pid, debugPort);
}

var bugger = withBugger(
  process.argv[2],
  process.argv.slice(3),
  !process.env.BUGGER_NO_BREAK
);

var repl = require('repl').start({
  prompt: 'bugger> ',
  input: process.stdin,
  output: process.stdout
});

var knownCommands = require('../lib/commands');
var _ = require('lodash');
_.each(_.keys(knownCommands), function(cmdName) {
  repl.context[cmdName] = function() {
    var result = bugger[cmdName].apply(bugger, arguments);
    result.nodeify(function(err, data) {
      repl.context.$err = err;
      repl.context.$data = data;
    });
    return result;
  };
});

repl.context.bugger = bugger;

bugger.connect();
