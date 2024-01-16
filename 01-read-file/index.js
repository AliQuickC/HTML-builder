const path = require('path');
const fs = require('fs');

var stream = new fs.ReadStream(path.join(__dirname, 'text.txt'), {
  encoding: 'utf-8',
});

stream.on('readable', function () {
  var data = stream.read();
  if (data != null) {
    // console.log(data.length);
    console.log(data);
  }
});

stream.on('error', function (err) {
  if (err.code == 'ENOENT') {
    console.log('File not found');
  } else {
    console.error(err);
  }
});

stream.on('end', function () {
  // console.log('THE END');
});
