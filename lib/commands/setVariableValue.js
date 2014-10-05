'use strict';

module.exports = function(DebugClient) {
  DebugClient.prototype.setVariableValue =
  function setVariableValue(name, newValue, ctx) {
    var opts = {
      name: name,
      newValue: newValue,
      scope: {
        frameNumber: ctx.frame,
        number: ctx.scope
      }
    };
    return (
      this._sendRequest('setVariableValue', opts)
      .then(function() {
        // no response expected
      })
    );
  };
};
