import {decode} from 'html-entities';
import highlightJs from 'highlight.js';
import {CodeToken} from './index';
import {expandRangeStringValues} from './range';
import {JSDOM} from 'jsdom';

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

  let lineIndex = 0;
  let resultFileLineIndex = 1;

  const highlightedLineRanges = token.highlight ? expandRangeStringValues(token.highlight) : [];

  const containerEl = new JSDOM().window.document.body;

  do {
    const isRemovedLine = token.diffMetadata?.linesRemoved.includes(lineIndex);
    const isAddedLine = token.diffMetadata?.linesAdded.includes(lineIndex);
    const isHighlighted = highlightedLineRanges.includes(lineIndex);
    const addClasses = (el: Element) => {
      if (isRemovedLine) {
        el.classList.add(lineRemovedClassName);
      }
      if (isAddedLine) {
        el.classList.add(lineAddedClassName);
      }
      if (isHighlighted) {
        el.classList.add(lineHighlightedClassName);
      }
    };

    if (!!token.linenums) {
      const lineNumberEl = JSDOM.fragment(
        `<span role="presentation" class="${lineNumberClassName}"></span>`,
      ).firstElementChild!;
      addClasses(lineNumberEl);
      lineNumberEl.textContent = isRemovedLine ? '-' : isAddedLine ? '+' : `${resultFileLineIndex}`;
      containerEl.appendChild(lineNumberEl);
      resultFileLineIndex++;
    }

    const lineEl = JSDOM.fragment(
      `<div class="${lineMultifileClassName}">${lines[lineIndex]}</div>`,
    ).firstElementChild!;
    addClasses(lineEl);
    containerEl.appendChild(lineEl);

    lineIndex++;
  } while (lineIndex < linesCount);

  token.code = containerEl.innerHTML;
}
