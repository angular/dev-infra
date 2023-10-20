import {readFileSync, writeFileSync} from 'fs';
import {EntryCollection, generateManifest} from './generate_manifest';

function main() {
  const [srcs, outputFilenameExecRootRelativePath] = process.argv.slice(2);

  const sourceContents = srcs
    .split(',')
    .map((srcPath) => readFileSync(srcPath, {encoding: 'utf8'}));
  const apiCollections = sourceContents.map((s) => JSON.parse(s) as EntryCollection);

  const manifest = generateManifest(apiCollections);
  writeFileSync(outputFilenameExecRootRelativePath, JSON.stringify(manifest), {encoding: 'utf8'});
}

main();
