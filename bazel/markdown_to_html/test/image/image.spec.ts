import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('image/image.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(kitchenSyncFilePath));
  });

  it('should wrap images in custom classes', () => {
    const image = markdownDocument.querySelector('img');
    expect(image?.classList.contains('docs-image')).toBeTrue();
  });

  it('should handle images hosted internal to the application', () => {
    const image = markdownDocument.querySelector('img[title="Local Image"]');
    expect(image?.getAttribute('src')).toBe('unknown/some-image.png');
  });
});
