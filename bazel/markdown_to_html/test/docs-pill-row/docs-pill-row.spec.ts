import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('docs-pill-row/docs-pill-row.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(kitchenSyncFilePath));
  });

  it('should create a nav container with all of the docs pills inside', () => {
    const navEl = markdownDocument.querySelector('nav');
    expect(navEl?.children.length).toBe(2);
    expect(navEl?.classList.contains('docs-pill-row')).toBeTrue();
  });
});
