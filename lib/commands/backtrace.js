'use strict';

var fromV8Type = require('../types').fromV8Type;

function createResponse(raw) {
  var refMap = {};
  if (Array.isArray(raw.refs)) {
    raw.refs.forEach(function(ref) {
      ref.handle = ref.handle.toString();
      refMap[ref.handle] = ref;
    });
  }
  return fromV8Type(raw.body, refMap, 'backtrace');
}

function backtrace(opts) {
  if (typeof opts === 'undefined')
    opts = {};
  if (typeof opts.inlineRefs === 'undefined')
    opts.inlineRefs = true;

  /*jshint validthis:true */
  return (
    this._sendRequest('backtrace', opts)
    .then(createResponse)
  );
}

module.exports = backtrace;
