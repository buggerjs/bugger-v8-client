'use strict';

var fromV8Type = require('../types').fromV8Type;

function backtrace(opts) {
  if (typeof opts === 'undefined')
    opts = {};
  if (typeof opts.inlineRefs === 'undefined')
    opts.inlineRefs = true;

  /*jshint validthis:true */
  return this._sendRequest('backtrace', opts);
}

backtrace.createResponse = function(raw, refMap) {
  return fromV8Type(raw, refMap, 'backtrace');
};

module.exports = backtrace;
