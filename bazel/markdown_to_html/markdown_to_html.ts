import {marked} from 'marked';

/** Given the file name of a markdown file, return the corresponding html file name.  */
export function markdownFilenameToHtmlFilename(fileName: string): string {
  if (!fileName.toLowerCase().endsWith('.md')) {
    throw new Error(`Input file "${fileName}" does not end in a ".md" file extension.`);
  }

  return fileName.substring(0, fileName.length - '.md'.length) + '.html';
}

/** Renders markdown to html with additional Angular-specific extensions. */
export function markdownToHtml(markdownSource: string): string {
  return marked.parse(markdownSource);
}
