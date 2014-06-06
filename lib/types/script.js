'use strict';

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

function scriptUrlFromName(name) {
  if (name) {
    return 'file://' + name.replace(/\\/g, '/');
  }
  // expected for eval "scripts"
  return undefined;
}

Script.unmarshal = function(raw, reviver) {
  var context = reviver(raw.context);
  var script = new Script(
    '' + raw.id,
    scriptUrlFromName(raw.name),
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

module.exports = Script;

/**
{ handle: '32',
  type: 'script',
  name: 'timers.js',
  id: 24,
  lineOffset: 0,
  columnOffset: 0,
  lineCount: 249,
  sourceStart: '(function (exports, require, module, __filename, __dirname) { // Copyright Joyen',
  sourceLength: 6798,
  scriptType: 2,
  compilationType: 0,
  context: { ref: 31 },
  text: 'timers.js (lines: 249)' }
 */
/**
{ "method": "Debugger.scriptParsed",
  "params": {
    "scriptId": <ScriptId>,
    "url": <string>,
    "startLine": <integer>,
    "startColumn": <integer>,
    "endLine": <integer>,
    "endColumn": <integer>,
    "isContentScript": <boolean>,
    "sourceMapURL": <string> } } */
// module.exports = function fromV8Script(refMap, raw, target, fromV8Type) {
//   target.scriptId = raw.id.toString();
//   target.url = 'file://' + raw.name.replace(/\\/g, '/');
//   target.startLine = raw.lineOffset;
//   target.startColumn = raw.columnOffset;
//   target.isContentScript = false;

//   if ('string' === typeof raw.source) {
//     console.log('Has source:', raw.id);
//   }
//   return target;
// };
