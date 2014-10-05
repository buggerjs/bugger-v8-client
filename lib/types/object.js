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

RemoteObject.unmarshal = function(raw, reviver) {
  // console.log('object', raw);
  return new RemoteObject(
    classNameToSubType[raw.className],
    raw.handle,
    raw.className,
    raw.className
  );
};

module.exports = RemoteObject;
