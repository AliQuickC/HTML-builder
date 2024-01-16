const path = require('path');
var fs = require('fs');

const buildDir = path.join(__dirname, 'project-dist');

build();

async function build() {
  await createOutFolder(buildDir);
  await buildHTML();
  await mergeStyles(path.join(__dirname, 'styles'), buildDir, 'style.css');
  await copyFolder(
    path.join(__dirname, 'assets'),
    path.join(buildDir, 'assets'),
  );
}

async function copyFolder(dirFrom, dirTo) {
  await createFolder(dirTo);
  await clearFolder(dirTo, false);
  await copyFiles(dirFrom, dirTo);
  console.log('Assets folder copied');

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
                fs.rmdir(file, (err) => {
                  if (err) {
                    console.log(err);
                  }
                }); // delete the directory
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
        // console.log('items copy: ', items);
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
                  throw err;
                } // failed to copy file
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

async function mergeStyles(inpFold, outFold, outFile) {
  let bundle = [];

  await readStyles(inpFold);
  await buildStyles(outFold, outFile);
  console.log('File styles.css built');

  function readStyles(folder) {
    return new Promise((resolve) => {
      fs.readdir(folder, async function (err, items) {
        for (const item of items) {
          const file = folder + '/' + item;
          await readStyleFile(file);
        }
        resolve();
      });
    });
  }

  function buildStyles(outFold, outFile) {
    return new Promise((resolve) => {
      const fileName = path.join(outFold, outFile);
      fs.writeFile(fileName, '', () => {}); // create file

      const outputFile = fs.createWriteStream(fileName, 'utf-8');
      for (const item of bundle) {
        outputFile.write(item);
      }
      outputFile.end();
      resolve();
    });
  }

  function readStyleFile(file) {
    return new Promise((resolve) => {
      const ext = path.extname(file);

      fs.stat(file, function (err, stats) {
        if (!stats.isDirectory() && ext === '.css') {
          readFileToArray(file, bundle, resolve);
        } else {
          resolve();
        }
      });
    });
  }

  function readFileToArray(file, array, callback) {
    var stream = new fs.ReadStream(file, { encoding: 'utf-8' });
    stream.on('readable', function () {
      var data = stream.read();
      if (data != null) {
        // console.log(data.length);
        array.push(data);
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
      array.push('\n');
      callback();
    });
  }
}

async function buildHTML() {
  const outFileName = path.join(buildDir, './', 'index.html');
  const inputFileName = path.join(__dirname, './', 'template.html');

  let p = new Promise((resolve) => {
    resolve();
  });

  await p
    .then(createOutFile)
    .then(readHtmlToArray)
    .then(replaceTemplateTegs)
    .then(writeArrayToHTML);
  console.log('File index.html built');

  function writeArrayToHTML(arr) {
    return new Promise((resolve) => {
      const outputFile = fs.createWriteStream(outFileName, 'utf-8');
      for (const item of arr) {
        outputFile.write(item + '\n');
      }
      outputFile.end();
      resolve();
    });
  }

  async function replaceTemplateTegs(arr) {
    const templArr = [];

    for (let item of arr) {
      let startTegPos = item.indexOf('{{');
      if (startTegPos !== -1) {
        let endTegPos = item.indexOf('}}');
        if (endTegPos !== -1) {
          let teg = item.substr(startTegPos + 2, endTegPos - startTegPos - 2);
          let tegReplace = item.substr(
            startTegPos,
            endTegPos - startTegPos + 2,
          );
          let t = await getTemplateForTeg(teg);
          item = item.replace(tegReplace, t);

          templArr.push(item);
        }
      } else {
        templArr.push(item);
      }
    }
    return templArr;
  }

  async function getTemplateForTeg(templTeg) {
    const templlDir = path.join(__dirname, 'components');
    const templFile = path.join(templlDir, templTeg + '.html');

    let templTagContent = await readFileToString(templFile);

    return templTagContent;
  }

  function readFileToString(file) {
    return new Promise((resolve) => {
      var stream = new fs.ReadStream(file, {
        encoding: 'utf-8',
      });
      let strData = '';

      stream.on('readable', function () {
        var data = stream.read();
        if (data != null) {
          // console.log(data.length);
          strData += data;
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
        resolve(strData);
      });
    });
  }

  function createOutFile() {
    return new Promise((resolve) => {
      fs.writeFile(outFileName, '', (err) => {
        if (!err) {
          resolve();
        }
      });
    });
  }

  function readHtmlToArray() {
    return new Promise((resolve) => {
      let stream = new fs.ReadStream(inputFileName, {
        encoding: 'utf-8',
      });
      let htmlArray = [];

      stream.on('readable', function () {
        let data = stream.read();

        if (data != null) {
          let array = data.split('\n');
          if (data[data.length - 1] !== '\n' && htmlArray.length !== 0) {
            htmlArray[htmlArray.length] += array.shift();
          }
          htmlArray = htmlArray.concat(array);
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
        resolve(htmlArray);
      });
    });
  }
}

function createOutFolder(folder) {
  return new Promise((resolve) => {
    fs.mkdir(
      folder,
      {
        recursive: true,
      },
      (err) => {
        if (err) {
          throw err;
        } // failed to create folder
        resolve();
        console.log(`Folder "${path.basename(folder)}" successfully created`);
      },
    );
  });
}
