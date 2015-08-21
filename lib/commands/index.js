'use strict';

module.exports = {
  backtrace: require('./backtrace'),
  changelive: require('./changelive'),
  clearbreakpoint: require('./clearbreakpoint'),
  'continue': require('./continue'),
  // alias to work around keyword
  'continue_': require('./continue'),
  evaluate: require('./evaluate'),
  listbreakpoints: require('./listbreakpoints'),
  lookup: require('./lookup'),
  meta: require('./meta'),
  prepareGlobalRequire: require('./global-require'),
  scripts: require('./scripts'),
  setbreakpoint: require('./setbreakpoint'),
  setexceptionbreak: require('./setexceptionbreak'),
  setVariableValue: require('./setVariableValue'),
  suspend: require('./suspend')
};
