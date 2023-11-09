import {parseMarkdown} from '../../src/index';
import {runfiles} from '@bazel/runfiles';
import {JSDOM} from 'jsdom';

describe('markdown to html', () => {
  let markdownDocument: DocumentFragment;

  beforeAll(async () => {
    const kitchenSyncFilePath = runfiles.resolvePackageRelative('docs-callout/docs-callout.md');
    markdownDocument = JSDOM.fragment(await parseMarkdown(kitchenSyncFilePath));
  });

  it(`defaults to a helpful callout`, () => {
    const calloutDiv =
      markdownDocument.querySelector('#default-marker')!.parentElement?.parentElement;
    calloutDiv?.classList.contains('docs-callout-helpful');
  });
});
