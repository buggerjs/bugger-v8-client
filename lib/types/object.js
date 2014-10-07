'use strict';

var classNameToSubType = {
  Array: 'array',
  Date: 'date',
  RegExp: 'regexp'
};

function RemoteObject(subtype, objectId, className, description) {
  this.type = 'object';
  this.subtype = subtype;
  this.objectId = objectId;
  this.className = className;
  this.description = description;
}

RemoteObject.unmarshal = function(raw, reviver, scopePath) {
  if (scopePath === '?:?') {
    throw new Error('Needs scopePath');
  }
  return new RemoteObject(
    classNameToSubType[raw.className],
    'scope-handle:' + scopePath + ':' + raw.handle,
    raw.className,
    raw.className
  );
};

module.exports = RemoteObject;
