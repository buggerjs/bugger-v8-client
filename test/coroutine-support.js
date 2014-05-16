'use strict';

var Promise  = require('bluebird');
var mocha    = require('mocha');
var Runnable = mocha.Runnable;
var run      = Runnable.prototype.run;

Runnable.prototype.run = function (fn) {
  if (this.fn.constructor.name === 'GeneratorFunction') {
    this.fn   = Promise.coroutine(this.fn);
    this.sync = !(this.async = false);
  }

  return run.call(this, fn);
};
