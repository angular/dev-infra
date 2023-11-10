import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const cardContainerFilePath = runfiles.resolvePackageRelative(
      'docs-card-container/docs-card-container.md',
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(cardContainerFilePath));
  });

  it('creates card containers containing multiple cards', () => {
    const containerEl = markdownDocument.querySelector('.docs-card-grid');

    expect(containerEl!.children.length).toBe(2);
    expect(containerEl!.classList.contains('docs-card-grid')).toBeTrue();
  });
});
