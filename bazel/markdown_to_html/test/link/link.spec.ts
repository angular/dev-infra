import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';

describe('markdown to html', () => {
  let parsedMarkdown: string;
  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('link/link.md');
    parsedMarkdown = await parseMarkdown(kitchenSyncFilePath);
  });

  it('should render external links with _blank target', () => {
    expect(parsedMarkdown).toContain(
      '<a href="https://angular.dev" target="_blank">Angular Site</a>',
    );
  });

  it('should render links to anchors on the same page', () => {
    expect(parsedMarkdown).toContain('<a href="#test">same page</a>');
  });

  it('should render internal links that are relative paths', () => {
    expect(parsedMarkdown).toContain('<a href="../other/page">same site</a>');
  });
});
