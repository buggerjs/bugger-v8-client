
(function wrapper() {
  var inScope = 'closedOver';

  function clazz() {
    this.attr = 'v';
  }

  clazz.prototype.fn = function _fn(arg) {
    console.log('before brk', this.attr, typeof clazz);
    debugger;
    console.log('after brk', arg, inScope, typeof clazz);
  };

  var inst = new clazz();
  inst.fn('param');
})();
