'use strict';

var Module = require('module');

var unmarshal = require('../types').unmarshal;

function setScriptSource(scriptId, scriptSource) {
  // TODO: Handle unwrapped scripts, e.g. node.js or eval scripts
  // TODO: Handle paused state, e.g. stack frame changes
  var opts = {
    script_id: scriptId,
    new_source: Module.wrap(scriptSource),
    preview_only: false
  };

  /*jshint validthis:true */
  return this._sendRequest('changelive', opts)
    .then(function(result) {
      // TODO: Return affected callFrames as necessary
      return {};
    });
}

module.exports = function(DebugClient) {
  DebugClient.prototype.setScriptSource = setScriptSource;
};
