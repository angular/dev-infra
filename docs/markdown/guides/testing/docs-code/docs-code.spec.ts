import {parseMarkdown} from '../../../guides/parse';
import {runfiles} from '@bazel/runfiles';
import {readFile} from 'fs/promises';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const markdownContent = await readFile(
      runfiles.resolvePackageRelative('docs-code/docs-code.md'),
      {encoding: 'utf-8'},
    );
    markdownDocument = JSDOM.fragment(await parseMarkdown(markdownContent, {}));
  });

  it('converts docs-code elements into a code block', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[0];
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).toBe('this is code');
  });

  it('removes eslint comments from the code', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[1];
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).not.toContain('// eslint');
  });

  it('extract regions from the code', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[2];
    expect(codeBlock).toBeTruthy();
    expect(codeBlock?.textContent?.trim()).toContain(`const x = 'within the region';`);
    expect(codeBlock?.textContent?.trim()).not.toContain('docregion');
  });

  it('properly shows the diff of two provided file paths', () => {
    const codeBlock = markdownDocument.querySelectorAll('code')[3];
    expect(codeBlock).toBeTruthy();

    const codeLines = codeBlock.querySelectorAll('.hljs-ln-line');
    expect(codeLines[0].textContent).toContain('oldFuncName');
    expect(codeLines[0].classList.contains('remove')).toBeTrue();

    expect(codeLines[1].textContent).toContain('newName');
    expect(codeLines[1].classList.contains('add')).toBeTrue();

    expect(codeLines[2].classList.contains('add')).toBeFalse();
    expect(codeLines[2].classList.contains('remove')).toBeFalse();
  });
});
