'use strict';

function extractMeta() {
  var i;
  var meta = {
    pid: process.pid,
    cwd: process.cwd(),
    execPath: process.execPath
  };

  var execArgv = process.execArgv;
  for (i = 0; i < execArgv.length; ++i) {
    meta['execArgv_' + i] = execArgv[i];
  }

  var argv = process.argv;
  for (i = 0; i < argv.length; ++i) {
    meta['argv_' + i] = argv[i];
  }

  if (process.mainModule) {
    meta.mainModule = process.mainModule.filename;
  }

  return meta;
}

function fixupMeta(meta) {
  var cleaned = {
    pid: meta.pid,
    cwd: meta.cwd,
    execPath: meta.execPath,
    execArgv: [],
    mainModule: meta.mainModule,
    argv: []
  };

  for (var key in meta) {
    if (meta.hasOwnProperty(key)) {
      if (key.indexOf('execArgv_') === 0) {
        cleaned.execArgv[+key.substr(9)] = meta[key];
      } else if (key.indexOf('argv_') === 0) {
        cleaned.argv[+key.substr(5)] = meta[key];
      }
    }
  }

  return cleaned;
}

module.exports = function(DebugClient) {
  DebugClient.prototype.getMeta = function () {
    return this.evalSimple(extractMeta).then(fixupMeta);
  };
};
