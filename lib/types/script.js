'use strict';

var UrlMapper = (function() {
  var urlToName = {};
  var nameToUrl = {};

  var CORE_PATTERN = /^[\w]+\.js$/;
  function scriptUrlFromName(name) {
    var mapped;
    if (name) {
      if (CORE_PATTERN.test(name)) {
        mapped = 'native://node/lib/' + name;
      } else {
        mapped = 'file://' + name.replace(/\\/g, '/');
      }

      nameToUrl[name] = mapped;
      urlToName[mapped] = name;
    }
    // expected for eval "scripts"
    return mapped;
  }

  function scriptNameFromUrl(url) {
    if (!url) return;

    if (urlToName.hasOwnProperty(url)) {
      return urlToName[url];
    }
    return url.replace(/^(file:\/\/|native:\/\/node\/lib\/)/, '');
  }

  return {
    scriptUrlFromName: scriptUrlFromName,
    scriptNameFromUrl: scriptNameFromUrl
  };
})();

function Position(line, column) {
  this.line = line;
  this.column = column;
}

function EvalContext(script, pos, fn) {
  this.script = script;
  this.position = pos;
  this.functionName = fn;
}

var CompilationType = {
  Normal: 0,
  Eval: 1
};

function Script(id, url, length, lineCount, offset, preview, code, ctx) {
  this.scriptId = id;
  this.url = url;

  this.sourceLength = length;
  this.lineCount = lineCount;
  this.sourceOffset = offset;

  this.sourceCodePreview = preview;
  this.sourceCode = code;

  this.context = ctx;

  this.evalContext = null;
}

Script.prototype.setEvalContext = function(script, pos, fn) {
  this.evalContext = new EvalContext(script, pos, fn);
};

Script.unmarshal = function(raw, reviver) {
  var context = reviver(raw.context);
  var script = new Script(
    '' + raw.id,
    UrlMapper.scriptUrlFromName(raw.name),
    raw.sourceLength,
    raw.lineCount,
    new Position(raw.lineOffset, raw.columnOffset),
    raw.sourceStart,
    raw.source,
    context
  );

  if (raw.compilationType === CompilationType.Eval) {
    script.setEvalContext(
      reviver(raw.evalFromScript),
      new Position(
        raw.evalFromLocation.line,
        raw.evalFromLocation.column
      ),
      raw.evalFromFunctionName.value_
    );
  }

  return script;
};

Script.UrlMapper = UrlMapper;
module.exports = Script;
