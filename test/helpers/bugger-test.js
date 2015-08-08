'use strict';

import {execFile} from 'child_process';
import path from 'path';
import net from 'net';

import Bluebird from 'bluebird';

import {createDebugClient} from '../..';

const ROOT_DIR = path.join(__dirname, '..', '..');

async function waitForPaused(bugger) {
  await bugger._sendRequest('version');
  if (bugger.running === false) { return bugger; }

  await bugger.nextEvent('paused');
  return bugger;
}

function findDebugPort() {
  return new Bluebird(function(resolve, reject) {
    const server = net.createServer();
    server.on('error', reject);
    server.listen(0, () => {
      const {port} = server.address();
      server.close(() => resolve(port));
    });
  });
}

async function launchAndConnect(ctx, name, args, debugBreak) {
  const debugPrefix = debugBreak ? '--debug-brk=' : '--debug=';

  const debugPort = ctx.debugPort = await findDebugPort();
  const withNodeArgs = [ debugPrefix + debugPort ];
  if (typeof name === 'function') {
    withNodeArgs.push('--eval');
    withNodeArgs.push(`(${name.toString()})()`);
  } else {
    withNodeArgs.push(path.join(ROOT_DIR, 'example', name));
  }

  function launch() {
    const child = ctx.child = execFile(process.argv[0], withNodeArgs.concat(args), {
      cwd: process.cwd(), env: process.env
    });

    if (process.env.BUGGER_PIPE_CHILD) {
      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);
    }
    return child;
  }

  function connect() {
    const bugger = ctx.bugger = createDebugClient(debugPort);
    return debugBreak ? waitForPaused(bugger) : bugger;
  }

  return Bluebird.all([ launch(), Bluebird.delay(250).then(connect) ]);
}

function killAndDisconnect(child, bugger) {
  if (bugger) {
    bugger.on('error', function() {});
    bugger.close();
  }

  if (!child || !child.pid) { return; }
  
  process.kill(child.pid);
  if (child.connected) {
    return new Bluebird(resolve => {
      child.on('exit', resolve);
    });
  }
  return Bluebird.delay(150);
}

export default function buggerTest(parentTest, name, args, debugBreak, f) {
  if (typeof args === 'function') {
    f = args; args = []; debugBreak = true;
  } else if (typeof debugBreak === 'function') {
    f = debugBreak; debugBreak = true;
  }

  return parentTest.test(`w/ script: ${name} ${args} (break: ${debugBreak})`, async t => {
    const ctx = {};

    return Bluebird.resolve(launchAndConnect(ctx, name, args, debugBreak))
      .then(() => f(t, ctx.bugger, ctx.child, ctx.debugPort))
      .finally(() => killAndDisconnect(ctx.child, ctx.bugger));
  });
}
