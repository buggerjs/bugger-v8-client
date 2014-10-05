'use strict';

module.exports = {
  backtrace: require('./backtrace'),
  'continue': require('./continue'),
  // alias to work around keyword
  'continue_': require('./continue'),
  evaluate: require('./evaluate'),
  listbreakpoints: require('./listbreakpoints'),
  meta: require('./meta'),
  scripts: require('./scripts'),
  setbreakpoint: require('./setbreakpoint'),
  setexceptionbreak: require('./setexceptionbreak')
};
