'use strict';

function RemoteError(description) {
  this.type = 'object';
  this.description = description;
}

RemoteError.unmarshal = function(raw, reviver) {
  console.log(raw);
  return new RemoteError(raw.value);
}

module.exports = RemoteError;
