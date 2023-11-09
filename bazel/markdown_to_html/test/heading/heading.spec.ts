import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('heading/heading.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(kitchenSyncFilePath));
  });

  it('should treat # as document headers', () => {
    const header = markdownDocument.querySelector('header');
    expect(header?.classList.contains('docs-header')).toBeTrue();
  });

  it('should create a self referential link for non document headers', () => {
    const h2 = markdownDocument.querySelector('h2');
    const h2Anchor = h2?.nextElementSibling;

    const h2HeaderId = h2?.getAttribute('id');
    const h2AnchorHref = h2Anchor?.getAttribute('href');

    expect(h2HeaderId).toContain('headers-h2');
    expect(h2AnchorHref).toBe(`#${h2HeaderId}`);
  });

  it('should make the docs anchors unreachable by tab', () => {
    const docsAnchors = markdownDocument.querySelectorAll('.docs-anchor');
    for (const anchor of docsAnchors) {
      expect(anchor.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('increments when multiple duplicate header names are found', () => {
    const headers = markdownDocument.querySelectorAll('a.docs-anchor');
    const knownRefs = new Set<string>();
    for (const el of headers) {
      const href = el.getAttribute('href');
      expect(knownRefs.has(href!)).toBeFalse();
      knownRefs.add(href!);
    }
  });
});
