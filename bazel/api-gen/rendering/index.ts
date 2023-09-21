import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {DocEntry} from './entities';
import {getRenderable} from './processing';
import {renderEntry} from './rendering';

/** The JSON data file format for extracted API reference info. */
interface EntryCollection {
  moduleName: string;
  entries: DocEntry[];
}

/** Parse all JSON data source files into an array of collections. */
function parseEntryData(srcs: string[]): EntryCollection[] {
  return srcs.map((jsonDataFilePath) => {
    const fileContent = readFileSync(jsonDataFilePath, {encoding: 'utf8'});
    return JSON.parse(fileContent) as EntryCollection;
  });
}

/** Gets a normalized filename for a doc entry. */
function getNormalizedFilename(moduleName: string, entryName: string): string {
  // Angular entry points all contain an "@" character, which we want to remove
  // from the filename. We also swap `/` with an underscore.
  const normalizedModuleName = moduleName.replace('@', '').replace('/', '_');
  return `${moduleName}_${entryName}.html`;
}

function main() {
  const [srcs, outputFilenameExecRootRelativePath] = process.argv.slice(2);

  // Docs rendering happens in three phases that occur here:
  // 1) Aggregate all the raw extracted doc info.
  // 2) Transform the raw data to a renderable state.
  // 3) Render to HTML.

  // Parse all the extracted data from the source JSON files.
  // Each file represents one "collection" of docs entries corresponding to
  // a particular JS module name.
  const entryCollections: EntryCollection[] = parseEntryData(srcs.split(','));

  for (const collection of entryCollections) {
    const extractedEntries = collection.entries;
    const renderableEntries = extractedEntries.map((entry) =>
      getRenderable(entry, collection.moduleName),
    );

    const htmlOutputs = renderableEntries.map(renderEntry);

    for (let i = 0; i < htmlOutputs.length; i++) {
      const moduleName = collection.moduleName.replace(/@/g, '').replace(/\//g, '_');
      const entryName = collection.entries[i].name;

      const filename = `${moduleName}_${entryName}.html`;
      writeFileSync(path.join(outputFilenameExecRootRelativePath, filename), htmlOutputs[i], {
        encoding: 'utf8',
      });
    }
  }
}

main();
