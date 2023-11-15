import {decode} from 'html-entities';
import highlightJs from 'highlight.js';
import {DiffMetadata} from './diff';
import {CodeToken} from '.';
import {parseRangeString} from './range';

const lineNumberClassName: string = 'hljs-ln-number';
const lineMultifileClassName: string = 'hljs-ln-line';
const lineAddedClassName: string = 'add';
const lineRemovedClassName: string = 'remove';
const lineHighlightedClassName: string = 'highlighted';

/**
 * Updates the provided token's code value to include syntax highlighting.
 */
export function highlightCode(token: CodeToken) {
  // TODO(josephperrott): Handle mermaid usages i.e. language == mermaidClassName
  if (token.language !== 'none' && token.language !== 'file') {
    // Decode the code content to replace HTML entities to characters
    const decodedCode = decode(token.code);
    const {value} = token.language
      ? highlightJs.highlight(decodedCode, {language: token.language})
      : highlightJs.highlightAuto(decodedCode);
    token.code = value;
  }

  const lines = token.code.split(/\r\n|\r|\n/g);
  const linesCount = lines.length;
  if (linesCount === 0) {
    return;
  }

  let finalHtml = '';
  let lineIndex = 0;
  let resultFileLineIndex = 1;

  const highlightedLineRanges = token.highlight ? parseRangeString(token.highlight) : [];

  do {
    const isRemovedLine = token.diffMetadata?.linesRemoved.includes(lineIndex);
    const isAddedLine = token.diffMetadata?.linesAdded.includes(lineIndex);
    const isHighlighted = highlightedLineRanges.includes(lineIndex);
    const statusClasses = `${isAddedLine ? lineAddedClassName : ''} ${
      isRemovedLine ? lineRemovedClassName : ''
    } ${isHighlighted ? lineHighlightedClassName : ''}`;

    if (!!token.linenums) {
      if (isRemovedLine) {
        finalHtml += `<span role="presentation" class="${lineNumberClassName} ${statusClasses}">-</span>`;
      } else {
        finalHtml += `<span role="presentation" class="${lineNumberClassName} ${statusClasses}">${
          isAddedLine ? '+' : resultFileLineIndex
        }</span>`;
        resultFileLineIndex++;
      }
    }
    finalHtml += `<div class="${lineMultifileClassName} ${statusClasses}">${lines[lineIndex]}</div>`;
    lineIndex++;
  } while (lineIndex < linesCount);

  return finalHtml;
}
