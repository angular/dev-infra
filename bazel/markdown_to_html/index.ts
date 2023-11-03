import {readFileSync, writeFileSync} from 'fs';
import {markdownFilenameToHtmlFilename, markdownToHtml} from './markdown_to_html';
import path from 'path';

function main() {
  const [paramFilePath] = process.argv.slice(2);
  const rawParamLines = readFileSync(paramFilePath, {encoding: 'utf8'}).split('\n');
  const [srcs, outputFilenameExecRootRelativePath] = rawParamLines;

  for (const markdownSourcePath of srcs.split(',')) {
    const markdownContent = readFileSync(markdownSourcePath, {encoding: 'utf8'});
    const htmlOutputContent = markdownToHtml(markdownContent);

    const htmlFileName = markdownFilenameToHtmlFilename(markdownSourcePath);
    const htmlOutputPath = path.join(outputFilenameExecRootRelativePath, htmlFileName);

    writeFileSync(htmlOutputPath, htmlOutputContent, {encoding: 'utf8'});
  }
}

main();
