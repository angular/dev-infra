import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';

describe('markdown to html', () => {
  let parsedMarkdown: string;
  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('kitchen-sync/kitchen-sync.md');
    parsedMarkdown = await parseMarkdown(kitchenSyncFilePath);
  });

  it('should render ## headers as h2', () => {
    expect(parsedMarkdown).toContain('<h2>Headers (h2)</h2>');
  });
});
