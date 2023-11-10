import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const docsWorkflowFilePath = runfiles.resolvePackageRelative('docs-workflow/docs-workflow.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(docsWorkflowFilePath));
  });

  it('create an ordered list container around the docs-steps', () => {
    const docsWorkflowEl = markdownDocument.querySelector('.docs-steps')!;
    expect(docsWorkflowEl.tagName).toBe('OL');
    expect(docsWorkflowEl.children.length).toBe(2);
  });
});
