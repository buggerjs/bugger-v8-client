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
  var description = getDescription(className, raw);
  return new RemoteObject(
    classNameToSubType[className],
    'scope-handle:' + scopePath + ':' + raw.handle,
    className,
    description
  );
};

module.exports = RemoteObject;
