'use strict';

import test from 'blue-tape';
import {find} from 'lodash'

import buggerTest from '../helpers/bugger-test';

import Backtrace from '../../lib/types/backtrace';

async function getThreeScript(t, b) {
  const scripts = await b.getScriptsWithSource();
  const threeScript = find(scripts, ({url}) => /three\.js$/.test(url));
  t.ok(threeScript, 'Has a ...three.js script');
  return threeScript;
}

test('commands.setScriptSource', t => {
  buggerTest(t, 'three.js', async (t, b) => {
    const original = await getThreeScript(t, b);
    if (!original) {
      return;
    }
    t.ok(/= 10;/.test(original.sourceCode), 'Original source contains `= 10;`');
    t.ok(!(/= 20;/.test(original.sourceCode)), 'Original source does not contain `= 20;`');

    await b.setScriptSource(original.scriptId, original.sourceCode.replace('= 10;', '= 20;'));

    const patched = await getThreeScript(t, b);
    t.ok(!(/= 10;/.test(patched.sourceCode)), 'Patched source no longer contains `= 10;`');
    t.ok(/= 20;/.test(patched.sourceCode), 'Patched source contains `= 20;`');
  });

  t.end();
});
