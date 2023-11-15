import {decode} from 'html-entities';
import highlightJs from 'highlight.js';
import {DiffMetadata} from './diff';
import {CodeToken} from '.';

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
  if (token.language == 'none' || token.language == 'file') {
    return;
  }
  // Decode the code content to replace HTML entities to characters
  const decodedCode = decode(token.code);
  const {value} = token.language
    ? highlightJs.highlight(decodedCode, {language: token.language})
    : highlightJs.highlightAuto(decodedCode);
  token.code = value;
}

export function finalizeCodeHighlighting(
  htmlString: string,
  diffData: DiffMetadata,
  highlightedLines: number[],
  displayLineNums: boolean,
): string {
  const lines = htmlString.split(/\r\n|\r|\n/g);
  let finalHtml = '';

  let lineIndex = 0;
  let resultFileLineIndex = 1;
  const linesCount = lines.length;

  if (linesCount === 0) {
    return htmlString;
  }

  do {
    const isRemovedLine = diffData?.linesRemoved.includes(lineIndex);
    const isAddedLine = diffData?.linesAdded.includes(lineIndex);
    const isHighlighted = highlightedLines.includes(lineIndex);
    const statusClasses = `${isAddedLine ? lineAddedClassName : ''} ${
      isRemovedLine ? lineRemovedClassName : ''
    } ${isHighlighted ? lineHighlightedClassName : ''}`;

    if (displayLineNums) {
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
