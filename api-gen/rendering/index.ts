import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {DocEntry} from './entities';
import {processEntryForRender} from './processing';
import {renderEntry} from './rendering';

/** The JSON data file format for extracted API reference info. */
interface EntryList {
  entries: DocEntry[];
}

function main() {
  const [srcs, outputFilenameExecRootRelativePath] = process.argv.slice(2);

  // Each data file contains an array of entries, so we aggregate the entries of all
  // input data files.
  const entries = srcs.split(',').reduce((entries: DocEntry[], jsonDataFilePath: string) => {
    const fileContent = readFileSync(jsonDataFilePath, {encoding: 'utf8'});
    return entries.concat((JSON.parse(fileContent) as EntryList).entries) as DocEntry[];
  }, []);

  // Transform the data from its raw extracted form to its renderable form.
  // This includes any processors, such as markdown→html.
  const renderEntries = entries.map(processEntryForRender);

  // Render the processed data into the final HTML documents.
  const htmlOutputs = renderEntries.map(renderEntry);
  for (let i = 0; i < htmlOutputs.length; i++) {
    // TODO: make real file names
    writeFileSync(path.join(outputFilenameExecRootRelativePath, `${i}.html`), htmlOutputs[i], {
      encoding: 'utf8',
    });
  }
}

main();
