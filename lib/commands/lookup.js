'use strict';

var Bluebird = require('bluebird');
var _ = require('lodash');
var debug = require('debug')('bugger-v8-client:commands:lookup');

var unmarshal = require('../types').unmarshal;

var scopeObjectIdPattern = /^([\w-]+):([\d]+):([\d]+)(:.+)?$/;
function parseObjectId(objectId) {
  var match = objectId.match(scopeObjectIdPattern);
  if (match !== null) {
    return {
      type: match[1],
      frame: parseInt(match[2], 10),
      scope: parseInt(match[3], 10),
      scopePath: match[2] + ':' + match[3],
      handle: match[4] ? parseInt(match[4].slice(1), 10) : null
    };
  }
  throw new Error('Unsupported objectId: ' + objectId);
}

function generateObjectId(parsed, handle) {
  var scopePath = parsed.frame + ':' + parsed.scope;
  if (handle) {
    return 'scope-handle:' + scopePath + ':' + handle;
  } else {
    return 'scope:' + scopePath;
  }
}

function isLiteral(obj) {
  switch (obj.type) {
    case 'object':
      return obj.subtype === 'null';

    case 'string':
    case 'number':
    case 'boolean':
    case 'undefined':
      return true;

    default:
      return false;
  }
}

function unmarshalValue(parsed, refs, body) {
  var refd = _.find(refs, { handle: body && body.ref });
  if (refd) {
    _.extend(body, refd);
  }
  var mapped = unmarshal(
    { body: body, refs: refs }, null, parsed.scopePath);
  return mapped;
}

function unmarshalScopeProperties(parsed, refs, rawObj) {
  if (!Array.isArray(rawObj.properties)) {
    debug('rawObj has no properties', rawObj);
    return [];
  }
  return rawObj.properties.map(function(rawProp) {
    return {
      name: '' + rawProp.name,
      configurable: true,
      enumerable: true,
      writable: true,
      value: unmarshalValue(parsed, refs, rawProp.value)
    }
  });
}

function getScopeProperties(client, parsed) {
  var options = {
    frameNumber: parsed.frame,
    number: parsed.scope,
    inlineRefs: true
  };

  return client._sendRequest('scope', options)
    .then(function(raw) {
      return unmarshalScopeProperties(
        parsed, raw.refs, raw.body.object);
    });
}

function _lookupScopeHandleRaw(client, parsed) {
  var options = {
    handles: [ parsed.handle ],
    inlineRefs: true,
    includeSource: false
  };
  return client._sendRequest('lookup', options)
    .then(function(raw) {
      return {
        body: raw.body['' + parsed.handle],
        refs: raw.refs
      };
    });
}

function getScopeHandleProperties(client, parsed, ownProperties) {
  return _lookupScopeHandleRaw(client, parsed)
    .then(function(raw) {
      return unmarshalScopeProperties(
        parsed, raw.refs, raw.body);
    });
}

function toFunctionDetailsWithFrame(frame) {
  return function toFunctionDetails(raw, frame) {
    var ctorFn;
    if (raw.body.constructorFunction) {
      ctorFn = _.find(raw.refs, { handle: raw.body.constructorFunction.ref });
    }
    return {
      location: {
        scriptId: '' + raw.body.scriptId,
        lineNumber: raw.body.line,
        columnNumber: raw.body.column
      },
      functionName: raw.body.name || raw.body.inferredName,
      isGenerator: ctorFn && ctorFn.name === 'GeneratorFunction',
      scopeChain: (raw.body.scopes || []).map(function(rawScope) {
        rawScope.frameIndex = frame;
        return unmarshal({ body: rawScope }, 'scope');
      })
    };
  };
}

function getScopeHandleFunctionDetails(client, parsed) {
  return _lookupScopeHandleRaw(client, parsed)
    .then(toFunctionDetailsWithFrame(parsed.frame));
}

module.exports = function(DebugClient) {
  DebugClient.prototype.lookupProperties =
  function lookupProperties(objectId, ownProperties, accessorPropertiesOnly) {
    var parsed = parseObjectId(objectId);
    if (typeof ownProperties !== 'boolean') {
      throw new Error('lookupProperties expects ownProperties (bool)');
    }
    switch (parsed.type) {
      case 'scope':
        // TODO: support ownProperties
        if (ownProperties) {
          return Bluebird.resolve([]);
        }
        return getScopeProperties(this, parsed);

      case 'scope-handle':
        // TODO: support accessorPropertiesOnly
        if (accessorPropertiesOnly) {
          return Bluebird.resolve([]);
        }
        return getScopeHandleProperties(this, parsed, ownProperties);
    }
    throw new Error('Lookup of ' + objectId + ' (' + parsed.type + ') not supported');
  };

  DebugClient.prototype.lookupFunctionDetails =
  function lookupFunctionDetails(objectId) {
    var parsed = parseObjectId(objectId);
    switch (parsed.type) {
      case 'scope-handle':
        return getScopeHandleFunctionDetails(this, parsed);
    }
    throw new Error('Lookup of ' + objectId + ' (' + parsed.type + ') not supported');
  };

  DebugClient.prototype.lookupFunctionDetailsOfExpression =
  function lookupFunctionDetailsOfExpression(expression) {
    var opts = {
      expression: expression,
      global: true
    };
    return this._sendRequest('evaluate', opts)
      .then(toFunctionDetailsWithFrame());
  };
};
