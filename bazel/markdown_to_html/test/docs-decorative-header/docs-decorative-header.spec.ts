import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const headerFilePath = runfiles.resolvePackageRelative(
      'docs-decorative-header/docs-decorative-header.md',
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(headerFilePath));
  });

  it('sets the custom title in the header', () => {
    expect(markdownDocument.querySelector('h1')?.textContent).toBe('Custom Title');
  });

  it('includes provided svgs', () => {
    expect(markdownDocument.querySelector('svg')).toBeTruthy();
  });

  it('passes the header text to the content', () => {
    expect(markdownDocument.querySelector('p')?.textContent?.trim()).toBe('This is header text');
  });
});
