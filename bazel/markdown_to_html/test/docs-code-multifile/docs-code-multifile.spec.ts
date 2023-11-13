import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative(
      'docs-code-multifile/docs-code-multifile.md',
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(kitchenSyncFilePath));
  });

  it('converts triple ticks into a code block', () => {
    const multiFileEl = markdownDocument.querySelector('.docs-code-multifile');
    expect(multiFileEl).toBeTruthy();

    const codeBlockOne = multiFileEl!.children[0]!;
    expect(codeBlockOne).toBeTruthy();
    expect(codeBlockOne?.textContent?.trim()).toBe('this is code');

    const codeBlockTwo = multiFileEl!.children[1]!;
    expect(codeBlockTwo).toBeTruthy();
    expect(codeBlockTwo?.textContent?.trim()).toBe('this is also code');
  });
});
