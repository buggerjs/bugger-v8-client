function forStack() {
  console.log('about to throw');
  throw new Error('err message');
  console.log('did throw', err);
}

forStack();
