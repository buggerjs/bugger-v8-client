'use strict';

import test from 'blue-tape';
import {find} from 'lodash';

import buggerTest from '../helpers/bugger-test';

test('commands.scripts', function(t) {
  buggerTest(t, 'three.js', async (t, b) => {
    const scripts = await b.getScriptsWithSource();
    const threeScript = find(scripts, ({url}) =>
      url.indexOf('example/three.js') !== -1);
    t.ok(threeScript, 'finds example/three.js in scripts');

    t.equal(threeScript.sourceCode.indexOf('var a'), 0, 'Starts with the actual script');

    const single = await b.getScriptsWithSource([ threeScript.scriptId ]);
    t.equal(single.length, 1, 'Only fetches one script');
    t.equal(single[0].sourceCode, threeScript.sourceCode,
      'Can get source code of single script');
  });
});
