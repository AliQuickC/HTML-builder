const path = require('path');
const fs = require('fs');

const dirName = path.join(__dirname, 'secret-folder');

fs.readdir(dirName, { withFileTypes: true }, function (err, items) {
  // console.log(items);

  for (var i = 0; i < items.length; i++) {
    if (!items[i].isDirectory()) {
      const file = dirName + '/' + items[i].name;
      const fileP = path.parse(file);

      fs.stat(file, function (err, stats) {
        if (!stats.isDirectory()) {
          console.log(
            `${fileP.name} - ${fileP.ext.substr(1)} - ${
              stats['size'] / 1000
            }kb`,
          );
        }
      });
    }
  }
});
