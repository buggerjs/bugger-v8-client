'use strict';

import test from 'blue-tape';

import buggerTest from '../helpers/bugger-test';

test('commands.setbreakpoint', t => {
  buggerTest(t, 'three.js', async (t, b) => {
    const breakpoint = await b.setbreakpoint({
      type: 'scriptRegExp', target: 'three.js', line: 1, column: 0 });
    t.deepEqual([ 1, 0 ], [ breakpoint.lineNumber, breakpoint.columnNumber ],
      'break point is at line 1, column 0');

    b.resume();
    const breakEvent = await b.nextEvent('break');
    t.deepEqual([ 1, 0 ], [ breakEvent.location.line, breakEvent.location.column ],
      'script pauses at [ 1, 0 ]');
  });
});
