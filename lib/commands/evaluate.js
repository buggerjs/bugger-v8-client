
var fromV8Type = require('../types').fromV8Type;

function assertObjectGroup(objectGroup) {
  return "root.__bugger__ || (root.__bugger__ = {});"
       + "root.__bugger__[" + JSON.stringify(objectGroup) + "]"
       + " || (root.__bugger__[" + JSON.stringify(objectGroup) + "] = {});";
};

function safeInObjectGroup(objectGroup, objectId, expr) {
  return assertObjectGroup(objectGroup)
       + "root.__bugger__[" + JSON.stringify(objectGroup) + "]"
       + "[" + JSON.stringify(objectGroup) + "] = (" + expr + ");";
};

module.exports = function evaluate(expression, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts;
    opts = {
      doNotPauseOnExceptionsAndMuteConsole: true
    };
  }
  if ('function' !== typeof cb) cb = function(){}

  if ('function' === typeof expression) {
    expression = '((' + expression.toString() + ')())';
  }

  // don't fail terribly on empy expressions
  if (expression.trim() === '') expression = '(void 0)';

  var reqParams = {
    disable_break: !!opts.doNotPauseOnExceptionsAndMuteConsole,
    global: !opts.callFrameId,
    frame: opts.callFrameId
  };

  var forcedId = null;
  if (reqParams.global && opts.objectGroup && opts.forceObjectId) {
    expression = safeInObjectGroup(
      opts.objectGroup, opts.forceObjectId.toString(), expression
    );
    forcedId = opts.objectGroup + ':' + opts.forceObjectId;
  }
  reqParams.expression = expression;

  // TODO: determine what semantic we want here
  // if (opts.returnByValue === true) {
  //   reqParams.inline_refs = true;
  // }

  if (Array.isArray(opts.injectObjects)) {
    reqParams.additional_context = opts.injectObjects.map(function(injectObject) {
      return {
        name: injectObject.name,
        handle: parseInt(injectObject.objectId, 10)
      };
    });
  }

  this._sendRequest('evaluate', reqParams, function(err, raw, refMap) {
    if (err != null) return cb(err);
    return cb(null, fromV8Type(raw, refMap));
  });
};