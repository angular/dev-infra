import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('list/list.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(kitchenSyncFilePath));
  });

  it('should wrap lists in custom classes', () => {
    const orderedList = markdownDocument.querySelector('ol');
    expect(orderedList?.className).toBe('docs-ordered-list');
    expect(orderedList?.childElementCount).toBe(3);
    expect(orderedList?.textContent).toContain('First Item');

    const unorderedList = markdownDocument.querySelector('ul');
    expect(unorderedList?.className).toBe('docs-list');
    expect(unorderedList?.childElementCount).toBe(4);
    expect(unorderedList?.textContent).toContain('matter');
  });
});
