/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import {JSDOM} from 'jsdom';
import {runInNewContext} from 'vm';
import {runfiles} from '@bazel/runfiles';

/** Absolute file path to the built minified app bundle. */
const bundleScriptPath = runfiles.resolveWorkspaceRelative(
  'bazel/benchmark/app_bundling/test/bundle.min.js',
);

const appIndexHtml = `
  <html lang="en">
    <body>
      <app-root></app-root>
    </body>
  </html>
`;

describe('app bundling', () => {
  /**
   * Executes the app in a virtual DOM and waits for bootstrap
   * to complete.
   */
  async function executeBundleWithVirtualDom() {
    const code = await fs.promises.readFile(bundleScriptPath, 'utf8');
    const {window} = new JSDOM(appIndexHtml);
    const document = window.document;

    runInNewContext(code, {
      window,
      document,
      require,
      setTimeout,
      global: {},
      exports: {},
    });

    await window.bootstrapPromise;

    return {window, document};
  }

  it('should be possible to run the generated bundle', async () => {
    const {document} = await executeBundleWithVirtualDom();

    expect(document.body.innerHTML).toContain('<span>Hello</span>');
    expect(document.body.innerHTML).toContain('<app-root ng-version');
  });
});
