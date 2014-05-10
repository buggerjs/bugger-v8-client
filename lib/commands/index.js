'use strict';

var commands = {
  backtrace: require('./backtrace'),
  'continue': require('./continue'),
  setexceptionbreak: require('./setexceptionbreak')
};

function createResponse(raw) {
  var refMap = {};
  if (Array.isArray(raw.refs)) {
    raw.refs.forEach(function(ref) {
      ref.handle = ref.handle.toString();
      refMap[ref.handle] = ref;
    });
  }
  var cmd = commands[raw.command];
  if (cmd) {
    return new cmd.createResponse(raw.body, refMap, raw.command);
  } else {
    return raw;
  }
}

exports.createResponse = createResponse;
exports.commands = commands;
