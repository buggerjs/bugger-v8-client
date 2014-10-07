'use strict';

var unmarshal = require('../types').unmarshal;

function toPlainValue(res) {
  var refs = res.refs;

  function _getFromRef(handle) {
    return _toPlainValue(refs.find(function(refObj) {
      return String(refObj.handle) === String(handle);
    }));
  }

  function _toPlainObject(raw) {
    if (raw.className === 'Array') {
      return raw.properties.reduce(function(arr, prop) {
        if (prop.name === 'length') return arr;
        arr[+prop.name] = _getFromRef(prop.ref);
        return arr;
      }, []);
    }
    return raw.properties.reduce(function(obj, prop) {
      obj[prop.name] = _getFromRef(prop.ref);
      return obj;
    }, {});
  }

  function _toPlainValue(raw) {
    switch (raw.type) {
      case 'object':
        return _toPlainObject(raw);

      case 'number':
      case 'string':
      case 'boolean':
      case 'undefined':
        return raw.value;
    }
    console.log(raw, refs);
    return undefined;
  }

  return _toPlainValue(res.body);
}

function parseFrameId(frameId) {
  if (typeof frameId === 'string') {
    frameId = parseInt(frameId.replace(/^frame:/, ''), 10);
  }
  if (typeof frameId === 'number') {
    return frameId;
  }
  return undefined;
}

function prepareSimpleOption(fnOrExpression, frameId) {
  frameId = parseFrameId(frameId);

  var opts = typeof frameId === 'number' ?
    { frame: frameId } : { global: true };
  opts.disable_break = true;

  if (typeof fnOrExpression === 'function') {
    opts.expression = '(' + fnOrExpression.toString() + ')()';
  } else {
    opts.expression = String(fnOrExpression);
  }
  return opts;
}

function parseError(err) {
  var errorProperties = {
    name: 'Error',
    message: err.message
  };
  var remoteObject = {
    objectId: 'error:' + JSON.stringify(errorProperties),
    type: 'object',
    className: 'Error',
    description: err.message
  };
  return remoteObject;
}

function convertToResult(frameId) {
  var _unmarshal = unmarshal.withFrameId(frameId);
  return function(raw) {
    return {
      result: _unmarshal(raw),
      wasThrown: false
    };
  };
}

function convertToThrown(err) {
  return { result: parseError(err), wasThrown: true };
}

module.exports = function(DebugClient) {
  DebugClient.prototype.evalSimple =
  function evalSimple(fnOrExpression, frameId) {
    var opts = prepareSimpleOption(fnOrExpression, frameId);
    return this._sendRequest('evaluate', opts)
      .then(toPlainValue);
  };

  DebugClient.prototype.evalNoBreak =
  function evalNoBreak(fnOrExpression, frameId) {
    var opts = prepareSimpleOption(fnOrExpression, frameId);
    return this._sendRequest('evaluate', opts)
      .then(convertToResult(opts.frame), convertToThrown);
  };
};
