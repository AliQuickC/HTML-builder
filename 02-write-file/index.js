const path = require('path');
const fs = require('fs');
const readline = require('readline');
const fileName = path.join(__dirname, './', 'text2.txt');

fs.writeFile(fileName, '', () => {}); // create file

const outputFile = fs.createWriteStream(fileName, 'utf-8');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('SIGINT', handle);
rl.on('SIGTERM', handle);
function handle() {
  console.log('\nThe program is completed!');
  outputFile.end();
  process.exit();
}

firstEnter();

function firstEnter() {
  rl.question(
    'The text will be written to the file. Enter the text: ',
    (value) => {
      enter(value);
      nextEnter();
    },
  );
}

function nextEnter() {
  rl.on('line', enter);
}

function enter(value) {
  if (value.toLowerCase() === 'exit') {
    console.log('The program is completed!');
    rl.close();
    outputFile.end();
    process.exit();
  }
  outputFile.write(value + '\n');
}
