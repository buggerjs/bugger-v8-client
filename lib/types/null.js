'use strict';

function Null() {
  this.type = 'object';
  this.subtype = 'null';
  this.description = 'null';
  this.value = null;
}

Null.unmarshal = function() {
  return new Null();
}

module.exports = Null;
