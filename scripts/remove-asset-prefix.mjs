import fs from "fs";

async function main() {
const filePath = './next.config.js';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  const updatedData = data.replace(
    /assetPrefix: '\.\/',\n?/,
    ''
  );

  fs.writeFile(filePath, updatedData, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('assetPrefix property has been removed from next.config.js');
  });
});
}

main();