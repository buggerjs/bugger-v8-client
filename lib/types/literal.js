'use strict';

function Literal(type, value) {
  this.type = type;
  this.value = value;
}

Literal.unmarshal = function(raw) {
  return new Literal(raw.type, raw.value);
};

module.exports = Literal;
