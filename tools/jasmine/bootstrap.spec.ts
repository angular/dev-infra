/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {join} from 'path';
import {testTmpDir} from '../../ng-dev/utils/testing/bazel-env';

describe('bootstraping script', () => {
  // This specific describe block is explicitly testing that
  jasmine.getEnv().configure({
    ...jasmine.getEnv().configuration(),
    random: false,
  });

  /** A randomized string to write into the file to confirm it was removed. */
  const testContent = `This is random: ${Math.random()}`;
  /** The absolute path to a file within the temporary test directory. */
  const testFilePath = join(testTmpDir, 'test-file');
  /** The number of tests which have run within the describe block. */
  let testCount = 0;

  it('allows files in the temp directory to be modified', () => {
    // The postfix increment operator is used to check the current value, while incrementing by 1.
    expect(testCount++).toBe(0);
    // Write the test content to the a file in the temporary test directory.
    writeFileSync(testFilePath, testContent);

    expect(readFileSync(testFilePath, {encoding: 'utf8'})).toBe(testContent);
  });

  it('ensures the files created in previous tests are not kept between specs', () => {
    // The postfix increment operator is used to check the current value, while incrementing by 1.
    expect(testCount++).toBe(1);
    /** A matcher for a file not existing at the path provided. */
    const errorMatcher = new RegExp(/^ENOENT\: no such file or directory, open/);

    expect(() => readFileSync(testFilePath, {encoding: 'utf8'})).toThrowError(errorMatcher);
  });
});
