'use strict';

function MapProxy(objectId) {
  this.type = 'object';
  this.subtype = 'map';
  this.objectId = objectId;
  this.className = 'Map';
  this.description = 'Map';
}

MapProxy.unmarshal = function(raw, reviver, scopePath) {
  if (scopePath === '?:?') {
    throw new Error('Needs scopePath');
  }
  return new MapProxy(
    'scope-handle:' + scopePath + ':' + raw.handle
  );
};

module.exports = MapProxy;
