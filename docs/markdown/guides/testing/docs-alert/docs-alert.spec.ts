import {parseMarkdown} from '../../../guides/parse';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';
import {AlertSeverityLevel} from '../../../guides/extensions/docs-alert';
import {readFile} from 'fs/promises';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(
      runfiles.resolvePackageRelative('docs-alert/docs-alert.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  for (let level in AlertSeverityLevel) {
    it(`should create a docs-alert for ${level}:`, () => {
      const noteEl = markdownDocument.querySelector(`.docs-alert-${level.toLowerCase()}`);
      // TLDR is written without a semi colon in the markdown, but is rendered with a colon, as
      // such we have to adjust our expectation here.
      if (level === AlertSeverityLevel.TLDR) {
        level = 'TL;DR';
      }
      expect(noteEl?.textContent?.trim()).toMatch(`^${level}:`);
    });
  }
});
