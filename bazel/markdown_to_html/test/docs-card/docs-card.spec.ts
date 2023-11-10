import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const cardFilePath = runfiles.resolvePackageRelative('docs-card/docs-card.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(cardFilePath));
  });

  it('creates cards with no links', () => {
    const cardEl = markdownDocument.querySelectorAll('.docs-card')[0];

    expect(cardEl.querySelector('h3')?.textContent?.trim()).toBe('No Link Card');
    expect(cardEl.tagName).not.toBe('A');
  });

  it('creates cards withs links', () => {
    const cardEl = markdownDocument.querySelectorAll('.docs-card')[1];

    expect(cardEl.querySelector('h3')?.textContent?.trim()).toBe('Link Card');
    expect(cardEl.tagName).toBe('A');

    expect(cardEl.getAttribute('href')).toBe('in/app/link');
  });

  it('creates cards with svg images', () => {
    const cardEl = markdownDocument.querySelectorAll('.docs-card')[2];

    expect(cardEl.querySelector('h3')?.textContent?.trim()).toBe('Image Card');
    expect(cardEl.querySelector('svg')).toBeTruthy();
  });
});
