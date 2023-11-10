import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const docsVideoFilePath = runfiles.resolvePackageRelative('docs-video/docs-video.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(docsVideoFilePath));
  });

  it('should create an iframe in a container', () => {
    const videoContainerEl = markdownDocument.querySelector('.docs-video-container')!;
    const iframeEl = videoContainerEl.children[0];

    expect(videoContainerEl.children.length).toBe(1);

    expect(iframeEl.nodeName).toBe('IFRAME');
    expect(iframeEl.getAttribute('src')).toBeTruthy();
    expect(iframeEl.classList.contains('docs-video')).toBeTrue();
    expect(iframeEl.getAttribute('title')).toBeTruthy();
  });
});
