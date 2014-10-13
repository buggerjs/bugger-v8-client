'use strict';

function RemoteError(objectId, className, description) {
  this.type = 'object';
  this.objectId = objectId;
  this.className = className;
  this.description = description;
}

RemoteError.unmarshal = function(raw, reviver, scopePath) {
  if (scopePath === '?:?') {
    throw new Error('Needs scopePath');
  }
  return new RemoteError(
    'scope-handle:' + scopePath + ':' + raw.handle,
    raw.className,
    raw.text
  );
}

module.exports = RemoteError;
