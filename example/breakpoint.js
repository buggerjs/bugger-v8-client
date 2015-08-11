
(function wrapper() {
  var inScope = 'closedOver';

  function clazz() {
    this.attr = 'v';
  }

  clazz.prototype.fn = function(arg) {
    console.log('before brk', this.attr);
    debugger;
    console.log('after brk', arg, inScope);
    console.log(clazz);
  };

  var inst = new clazz();
  inst.fn('param');
})();
