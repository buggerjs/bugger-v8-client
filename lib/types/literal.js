'use strict';

function Literal(type, value, description) {
  this.type = type;
  this.value = value;
  this.description = description;
}

Literal.unmarshal = function(raw) {
  return new Literal(raw.type, raw.value, '' + raw.value);
};

module.exports = Literal;
