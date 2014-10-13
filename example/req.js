var uri = 'http://api.reddit.com/r/programming/about.json';
console.log('GET %s', uri);

debugger;

var http = require('http');

var req = http.get('http://api.reddit.com/r/programming/about.json');

function printSuccess() {
  debugger;
  console.log('ok');
}

req.on('response', function(res) {
  res.on('data', function(chunk) {});
  res.on('end', setTimeout.bind(null, printSuccess, 100));
});
