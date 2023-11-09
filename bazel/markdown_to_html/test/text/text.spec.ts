import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('text/text.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(kitchenSyncFilePath));
  });

  it('should wrap emoji in custom classes', () => {
    const emoji = markdownDocument.querySelector('span.docs-emoji');
    expect(emoji).toBeTruthy();
    expect(emoji?.textContent).toContain('😎');
  });

  it('should not apply a custom class if no emoji is present', () => {
    const [, noemoji] = markdownDocument.querySelectorAll('p');
    expect(noemoji).toBeTruthy();
    expect(noemoji?.textContent).not.toContain('😎');
  });
});
