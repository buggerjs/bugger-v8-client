'use strict';

var _ = require('lodash');

var classNameToSubType = {
  Array: 'array',
  Date: 'date',
  RegExp: 'regexp'
};

function getClassName(raw) {
  if (typeof raw.text === 'string') {
    return raw.text.replace(/^#<(.+)>$/, '$1');
  }
  return raw.className;
}

function getArrayLikeLength(className, raw, reviver) {
  if (className !== 'Array' && className !== 'Buffer') {
    return;
  }
  if (!Array.isArray(raw.properties)) {
    return;
  }
  var len = _.find(raw.properties, { name: 'length' });
  if (!len) {
    // For Uint8Array & friends `length` is a getter defined on the prototype.
    // The good news is that they are fixed-length and can't be sparse.
    // The bad news is that they actually might contain any number of non-numerical
    // properties which we ignore here. In other words, the following is WRONG:
    if (raw.className === 'Uint8Array') {
      return raw.properties.length;
    }
    return;
  }
  len = reviver(len);
  if (typeof len.value === 'number') {
    return len.value;
  } else if (len && len.value && len.value.type === 'number') {
    return len.value.value;
  }
}

function getDescription(className, raw) {
  if (className !== 'Array' && className !== 'Buffer') {
    return className;
  }
  if (!Array.isArray(raw.properties)) {
    return className;
  }
  var len = _.find(raw.properties, { name: 'length' });
  if (len && len.value && len.value.type === 'number') {
    return className + '[' + len.value.value + ']';
  }
  return className;
}

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
  var className = getClassName(raw);
  var len = getArrayLikeLength(className, raw, reviver);
  var subtype = classNameToSubType[className];
  var description = className;
  if (typeof len === 'number') {
    description += '[' + len + ']';
    subtype = 'array';
  }
  return new RemoteObject(
    subtype,
    'scope-handle:' + scopePath + ':' + raw.handle,
    className,
    description
  );
};

module.exports = RemoteObject;
