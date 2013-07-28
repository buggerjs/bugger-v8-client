
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
module.exports = function fromV8Script(refMap, raw, target, fromV8Type) {
  target.scriptId = raw.id.toString();
  target.url = 'file://' + raw.name.replace(/\\/g, '/');
  target.startLine = raw.lineOffset;
  target.startColumn = raw.columnOffset;
  target.isContentScript = false;

  if ('string' === typeof raw.source) {
    console.log('Has source:', raw.id);
  }
  return target;
};
