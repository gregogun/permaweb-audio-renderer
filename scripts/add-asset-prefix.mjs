import fs from "fs";

async function main() {
const filePath = './next.config.js';

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }

  if (data.includes('assetPrefix: \'./\',\n')) {
    console.log('assetPrefix property already exists in next.config.js');
    return;
  }


  const updatedData = data.replace(
    /const nextConfig = {/,
    `const nextConfig = {\n  assetPrefix: './',`
  );

  fs.writeFile(filePath, updatedData, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('assetPrefix property has been added to next.config.js');
  });
});
}

main();