
'use strict';

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

module.exports = function(DebugClient) {
  DebugClient.prototype.evalSimple = function (fnOrExpression, frameId) {
    var opts = typeof frameId === 'number' ?
      { frame: frameId } : { global: true };
    opts.disable_break = true;

    if (typeof fnOrExpression === 'function') {
      opts.expression = '(' + fnOrExpression.toString() + ')()';
    } else {
      opts.expression = String(fnOrExpression);
    }

    return this._sendRequest('evaluate', opts)
      .then(toPlainValue);
  };
};
