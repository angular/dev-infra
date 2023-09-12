import {writeFileSync} from 'fs';

function main() {
  const [srcs, outputFileName] = process.argv.slice(2);

  // TODO: read data with APIs from @angular/compiler-cli

  writeFileSync(outputFileName, JSON.stringify({entries: []}), {encoding: 'utf8'});
}

main();
