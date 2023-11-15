import {readFileSync} from 'fs';
import {Tokens} from 'marked';
import {runfiles} from '@bazel/runfiles';
import {calculateDiff} from './diff';
import {parseRangeString} from './range';
import {finalizeCodeHighlighting, highlightCode} from './highlight';
import {extractRegions} from './region';

/** Marked token for a custom docs element. */
export interface CodeToken extends Tokens.Generic {
  /* Nested code OR the code from the optional file path */
  code: string;
  /* Code language */
  language: string | undefined;

  /* The example file path */
  path?: string;
  /* The example display header */
  header?: string;
  /* Whether stling should include line numbers */
  linenums?: boolean;
  /* The example path to determine diff (lines added/removed) */
  diff?: string;
  /* The lines viewable in collapsed view */
  visibleLines?: string;
  /* The name of the viewable region in the collapsed view */
  visibleRegion?: string;
  /* Whether we should display preview */
  preview?: boolean;
  /* The lines to display highlighting on */
  highlight?: string;
}

export function formatCode(token: CodeToken) {
  const highlightedLineRanges = token.highlight ? parseRangeString(token.highlight) : [];
  const visibleLinesRanges = token.visibleLines ? parseRangeString(token.visibleLines) : [];

  if (token.visibleLines !== undefined && token.visibleRegion !== undefined) {
    throw Error('Cannot define visible lines and visible region at the same time');
  }

  extractRegions(token);

  let originalCode = '';
  if (token.diff !== undefined) {
    originalCode = readFileSync(runfiles.resolveWorkspaceRelative(token.diff), {encoding: 'utf-8'});
  }

  const {code, linesAdded, linesRemoved} = calculateDiff(originalCode, token.code);

  const hightlightedCode = highlightCode(code, token.language);

  const finalizedCode = finalizeCodeHighlighting(
    hightlightedCode,
    {code, linesAdded, linesRemoved},
    highlightedLineRanges,
    !!token.linenums,
  );

  return `
  <div>
    <pre class="adev-mini-scroll-track">
      <code>${finalizedCode}</code>
    </pre>
  </div>
  `;
}
