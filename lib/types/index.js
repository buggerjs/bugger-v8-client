
var typeHandlers = {
  backtrace: require('./backtrace'),
  frame: require('./frame'),
  scope: require('./scope'),
  script: require('./script'),
  object: require('./object'),
  number: require('./primitive'),
  string: require('./primitive'),
  boolean: require('./primitive'),
  undefined: require('./primitive'),
  function: require('./function')
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
      if (typeHint != null) body.type = typeHint;
      return _fromV8Type(refMap, seen, body);
    }
  );
  return target;
};

function fromV8Type(body, refMap, typeHint) {
  if (typeHint != null) body.type = typeHint;
  return _fromV8Type(refMap, [], body);
};

module.exports = {
  fromV8Type: fromV8Type
};
