'use strict';

var typeHandlers = {
  backtrace: require('./backtrace'),
  breakpoint: require('./breakpoint'),
  error: require('./error'),
  frame: require('./frame'),
  'function': require('./function'),
  'null': require('./null'),
  object: require('./object'),
  regexp: require('./regexp'),
  scope: require('./scope'),
  script: require('./script')
};

var literalHandler = require('./literal');
[
  'undefined', 'string', 'number', 'boolean'
].forEach(function(literalType) {
  typeHandlers[literalType] = literalHandler;
});

function _unmarshal(raw, typeHint, scopePath) {
  scopePath = scopePath || '?:?';
  var refMap = {};
  if (Array.isArray(raw.refs)) {
    raw.refs.forEach(function(refObj) {
      refMap['' + refObj.handle] = refObj;
    });
  }
  var revived = {};

  function toRealObject(body, type, _localScopePath) {
    _localScopePath = _localScopePath || scopePath;
    var handle = body.handle;
    if (handle && revived[handle]) {
      return revived[handle];
    }

    var handler = typeHandlers[type];
    if (handler) {
      if (typeof handler.unmarshal !== 'function') {
        throw new Error('Invalid type handler for ' + type);
      }
      var obj = handler.unmarshal(body, reviver, _localScopePath);
      if (handle) revived[handle] = obj;
      return obj;
    }
    throw new Error('Unknown v8 type: ' + type);
  }

  function reviver(rawRef, typeHint, _localScopePath) {
    _localScopePath = _localScopePath || scopePath;

    if (!rawRef) return rawRef;
    var resolved;
    if (typeof rawRef.ref === 'number') {
      resolved = refMap['' + rawRef.ref];
      if (!resolved) {
        // TODO: return proxy object
        rawRef.handle = '' + rawRef.ref;
        resolved = rawRef;
      }
    } else {
      resolved = rawRef;
    }
    return toRealObject(resolved,
                        typeHint || resolved.type || rawRef.type,
                        _localScopePath);
  }

  var body = raw.body;
  var type = typeHint || body.type || raw.command;
  return toRealObject(raw.body, type, scopePath);
}

_unmarshal.withFrameId = function(frameId) {
  if (typeof frameId !== 'number') {
    return _unmarshal;
  }
  return function withFrameId(raw) {
    return _unmarshal(raw, null, '' + frameId + ':0');
  };
};

function _fromV8Type(refMap, seen, body) {
  if (body.ref != null) body.ref = body.ref.toString();

  if (body.ref != null) {
    if (refMap[body.ref] != null) {
      var attr, unreffed = refMap[body.ref];
      for (attr in unreffed) {
        body[attr] = unreffed[attr];
      }
    }
    body.handle = body.ref;
    delete body.ref;
  } else if (body.handle != null)
    body.handle = body.handle.toString();

  if (body.type == null) return body;

  var typeHandler = typeHandlers[body.type];
  if (typeHandler == null)
    throw new Error('Unknown v8 type: ' + body.type);

  var target = {};
  if (body.handle != null) {
    if (seen.indexOf(body.handle) !== -1) {
      return refMap[body.handle];
    }
    target.handle = body.handle;
    refMap[target.handle] = target;
    seen.push(target.handle);
  }

  typeHandler(
    refMap,
    body, target,
    function(body, typeHint) {
      if (typeHint) body.type = typeHint;
      return _fromV8Type(refMap, seen, body);
    }
  );
  return target;
}

function fromV8Type(body, refMap, typeHint) {
  if (typeHint) body.type = typeHint;
  return _fromV8Type(refMap, [], body);
}

module.exports = {
  fromV8Type: fromV8Type,
  unmarshal: _unmarshal
};
