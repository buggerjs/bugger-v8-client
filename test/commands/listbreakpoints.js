'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('commands.listbreakpoints', t => {
  buggerTest(t, 'three.js', async (t, b) => {
    await b.setbreakpoint({
      type: 'scriptRegExp', target: 'three.js', line: 1, column: 0 });

    const breaks = await b.listbreakpoints();
    t.equal(false, breaks.breakOnExceptions);
    t.equal(false, breaks.breakOnUncaughtExceptions);

    const points = breaks.breakpoints;
    t.ok(Array.isArray(points), 'Has array of breakpoints');
    t.equal(2, points.length, 'Two breakpoints (intial + custom)');

    // 1. initial breakpoint / --debug-brk
    t.equal('scriptId', points[0].type);
    t.equal(0, points[0].lineNumber);
    t.equal(10, points[0].columnNumber);

    // 2. custom breakpoint
    t.equal('scriptRegExp', points[1].type);
    t.equal(1, points[1].lineNumber);
    t.equal(0, points[1].columnNumber);
  });
});
