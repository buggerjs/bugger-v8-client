'use strict';

import {wrap} from 'module';

import test from 'blue-tape';

import {removeModuleWrapper} from '../../lib/types/script';

test('removeModuleWrapper', t => {
  const original = ' some text\nthat spans\nmultiple lines \t ';
  t.equal(
    removeModuleWrapper({ source: wrap(original), compilationType: 0 }),
    original,
    'Restores original from the wrapped version');

  t.end();
});
