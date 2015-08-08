'use strict';

module.exports = {
  backtrace: require('./backtrace'),
  clearbreakpoint: require('./clearbreakpoint'),
  'continue': require('./continue'),
  // alias to work around keyword
  'continue_': require('./continue'),
  evaluate: require('./evaluate'),
  listbreakpoints: require('./listbreakpoints'),
  lookup: require('./lookup'),
  meta: require('./meta'),
  scope: require('./scope'),
  scripts: require('./scripts'),
  setbreakpoint: require('./setbreakpoint'),
  setexceptionbreak: require('./setexceptionbreak'),
  setVariableValue: require('./setVariableValue')
};
