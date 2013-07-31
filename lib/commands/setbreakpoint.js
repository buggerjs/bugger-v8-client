
module.exports = function setbreakpoint(opts, cb) {
  if ('function' !== typeof cb) cb = function(){}

  var brkDesc = {
    line: opts.lineNumber,
    column: opts.columnNumber,
    condition: opts.condition,
    type: 'script',
    target: opts.url
  };

  if (opts.urlRegex != null) {
    brkDesc.type = 'scriptRegExp';
    brkDesc.target = opts.urlRegex;
  }

  return this._sendRequest('setbreakpoint', brkDesc, function(err, raw) {
    if (err != null) return cb(err);
    var actualBrk = {
      breakpointId: raw.breakpoint.toString(),
      locations: raw.actual_locations.map(function(l) {
        return {
          scriptId: l.script_id.toString(),
          lineNumber: l.line,
          columnNumber: l.column
        };
      })
    };
    return cb(null, actualBrk);
  });
};
