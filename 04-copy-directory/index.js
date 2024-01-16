const path = require('path');
var fs = require('fs');

copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));

async function copyFolder(dirFrom, dirTo) {
  await createFolder(dirTo);
  await clearFolder(dirTo, false);
  await copyFiles(dirFrom, dirTo);

  function createFolder(folder) {
    return new Promise((resolve) => {
      fs.mkdir(folder, { recursive: true }, (err) => {
        if (err) {
          throw err;
        } // failed to create folder
        resolve();
      });
    });
  }

  function clearFolder(dirName, fo) {
    return new Promise((resolve) => {
      fs.readdir(dirName, async function (err, items) {
        if (items.length === 0) {
          resolve();
        }

        for (const item of items) {
          const file = path.join(dirName, item);

          await deleteFile(file, fo);
        }
        resolve();
      });

      function deleteFile(file, fo) {
        return new Promise((resolve) => {
          fs.stat(file, async function (err, stats) {
            if (!stats.isDirectory()) {
              fs.unlink(file, function (err) {
                if (err) {
                  console.log(err);
                } else {
                  resolve();
                }
              });
            } else {
              await clearFolder(file, fo);
              if (fo === false) {
                // delete the directory
                fs.rmdir(file, (err) => {
                  if (err) {
                    console.log(err);
                  }
                });
              }
              resolve();
            }
          });
        });
      }
    });
  }

  function copyFiles(dirFrom, dirTo) {
    return new Promise((resolve) => {
      fs.readdir(dirFrom, async function (err, items) {
        if (items.length === 0) {
          resolve();
        }

        for (const item of items) {
          const fileFrom = path.join(dirFrom, item);
          const fileTo = path.join(dirTo, item);

          await copyFile(fileFrom, fileTo);
        }
        resolve();
      });

      function copyFile(from, to) {
        return new Promise((resolve) => {
          fs.stat(from, async function (err, stats) {
            if (!stats.isDirectory()) {
              fs.copyFile(from, to, (err) => {
                if (err) {
                  throw err; // failed to copy file
                }
                // console.log("File - " + file + " successfully copied");
                resolve();
              });
            } else {
              await createFolder(to);
              await copyFiles(from, to);
              resolve();
            }
          });
        });
      }
    });
  }
}
