import {readFileSync, writeFileSync} from 'fs';

/** The JSON data file format for extracted API reference info. */
interface EntryCollection {
  moduleName: string;
  entries: {name: string; entryType: string}[];
}

export interface ManifestEntry {
  name: string;
  type: string;
}

/** Manifest that maps each module name to a list of API symbols. */
type Manifest = Record<string, ManifestEntry[]>;

function main() {
  const [srcs, outputFilenameExecRootRelativePath] = process.argv.slice(2);

  const sourceContents = srcs
    .split(',')
    .map((srcPath) => readFileSync(srcPath, {encoding: 'utf8'}));
  const apiCollections = sourceContents.map((s) => JSON.parse(s) as EntryCollection);

  const manifest: Manifest = apiCollections.reduce((result, collection) => {
    return {
      ...result,
      [collection.moduleName]: collection.entries.map((e) => ({name: e.name, type: e.entryType})),
    };
  }, {});

  writeFileSync(outputFilenameExecRootRelativePath, JSON.stringify(manifest), {encoding: 'utf8'});
}

main();
