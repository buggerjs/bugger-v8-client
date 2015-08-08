'use strict';

import {execFile} from 'child_process';
import path from 'path';
import net from 'net';

import Bluebird from 'bluebird';

import {createDebugClient} from '../..';

const ROOT_DIR = path.join(__dirname, '..', '..');
let lastDebugPort = 5860;

async function waitForPaused(bugger) {
  await bugger._sendRequest('version');
  if (bugger.running === false) { return bugger; }

  await bugger.nextEvent('paused');
  return bugger;
}

function ensureAvailable(port) {
  return new Bluebird(function(resolve, reject) {
    const socket = net.connect(port);
    socket.on('error', err => {
      err.code === 'ECONNREFUSED' ? resolve() : reject(err);
    });
    socket.on('connect', () => {
      reject(new Error(`Something already listening on ${port}`));
    });
  });
}

async function launchAndConnect(ctx, name, args, debugBreak, debugPort) {
  const debugPrefix = debugBreak ? '--debug-brk=' : '--debug=';
  const filename = path.join(ROOT_DIR, 'example', name);

  const withNodeArgs = [ debugPrefix + debugPort, filename ].concat(args);

  function launch() {
    const child = ctx.child = execFile(process.argv[0], withNodeArgs, {
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

  await ensureAvailable(debugPort);

  return Bluebird.all([ launch(), Bluebird.delay(250).then(connect) ]);
}

function killAndDisconnect(child, bugger) {
  if (bugger) { bugger.close(); }

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

  return parentTest.test('w/ script: ' + name, async t => {
    const ctx = {};
    const debugPort = ++lastDebugPort;

    return Bluebird.resolve(launchAndConnect(ctx, name, args, debugBreak, debugPort))
      .then(() => f(t, ctx.bugger, ctx.child, debugPort))
      .finally(() => killAndDisconnect(ctx.child, ctx.bugger));
  });
}
