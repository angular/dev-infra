import {parseMarkdown} from '../../../guides/parse';
import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';
import {initHighlighter} from '../../extensions/docs-code/format/highlight';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    await initHighlighter();
    const markdownContent = await readFile(
      runfiles.resolvePackageRelative('docs-code/docs-code.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('converts docs-code elements into a code block', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[0];
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).toBe('this is code');
  });

  it('removes eslint comments from the code', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[1];
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).not.toContain('// eslint');
  });

  it('extract regions from the code', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[4];
    expect(codeBlock).toBeTruthy();

    expect(codeBlock?.textContent?.trim()).toContain(`const x = 'within the region';`);
    expect(codeBlock?.textContent?.trim()).not.toContain('docregion');
  });
});
