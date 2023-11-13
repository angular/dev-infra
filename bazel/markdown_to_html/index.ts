import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {parseMarkdown} from './src';

async function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFilenameExecRootRelativePath] = rawParamLines;

  for (const filePath of srcs.split(',')) {
    if (!filePath.endsWith('.md')) {
      throw new Error(`Input file "${filePath}" does not end in a ".md" file extension.`);
    }

    const markdownContent = readFileSync(filePath, {encoding: 'utf8'});
    const htmlOutputContent = await parseMarkdown(markdownContent);

    const htmlFileName = filePath.substring(0, filePath.length - '.md'.length) + '.html';
    const htmlOutputPath = path.join(outputFilenameExecRootRelativePath, htmlFileName);

    writeFileSync(htmlOutputPath, htmlOutputContent, {encoding: 'utf8'});
  }
}

main();
