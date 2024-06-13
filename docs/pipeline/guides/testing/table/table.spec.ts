import {readFile} from 'fs/promises';
import {parseMarkdown} from '../../../guides/parse';
import {runfiles} from '@bazel/runfiles';

describe('markdown to html', () => {
  let parsedMarkdown: string;
  beforeAll(async () => {
    const markdownContent = await readFile(runfiles.resolvePackageRelative('table/table.md'), {
      encoding: 'utf-8',
    });
    parsedMarkdown = await parseMarkdown(markdownContent, {});
  });

  it('should wrap the table in custom div', () => {
    expect(parsedMarkdown).toContain('<div class="docs-table docs-scroll-track-transparent">');
  });

  it('should place the initial row as table header cells', () => {
    expect(parsedMarkdown).toContain('<th><strong>Sports</strong></th>');
    expect(parsedMarkdown).toContain('<th><em>Season</em></th>');
  });

  it('should place the subsequent rows as regular table cells', () => {
    expect(parsedMarkdown).toContain('<td>Baseball</td>');
    expect(parsedMarkdown).toContain('<td>Year Round</td>');
  });
});
