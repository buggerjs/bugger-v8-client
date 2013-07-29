function forStack() {
  console.log('about to throw');
  try {
    throw new Error('err message');
  } catch (err) {
    console.log('did throw', err);
  }
}

forStack();
