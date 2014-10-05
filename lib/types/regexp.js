'use strict';

function RemoteRegExp(description) {
  this.type = 'object';
  this.subtype = 'regexp';
  this.description = description;
}

RemoteRegExp.unmarshal = function(raw, reviver) {
  return new RemoteRegExp(raw.value);
}

module.exports = RemoteRegExp;
