/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {blaze} from '../../../bazel/protos/test_status_pb';
import {join, extname} from 'path';
import {
  mkdirSync,
  rmSync,
  readFileSync,
  statSync,
  readdirSync,
  copyFileSync,
  writeFileSync,
} from 'fs';
import {debug, info} from '../../utils/console';
import {GitClient} from '../../utils/git/git-client';
import {bazel} from '../../utils/bazel';

/** Bazel's TestResultData proto Message. */
const TestResultData = blaze.TestResultData;

type TestResultFiles = [xmlFile: string, cacheProtoFile: string];

/**
 * A JUnit test report to always include signaling to CircleCI that tests were requested.
 *
 * `testsuite` and `testcase` elements are required for CircleCI to properly parse the report.
 */
const baseTestReport = `
 <?xml version="1.0" encoding="UTF-8" ?>
 <testsuites disabled="0" errors="0" failures="0" tests="0" time="0">
   <testsuite name="">
     <testcase name=""/>
   </testsuite>
 </testsuites>
 `.trim();

/**
 * Discover all test results, which @bazel/jasmine stores as `test.xml` files, in the directory and
 * return back the list of absolute file paths.
 */
function findAllTestResultFiles(dirPath: string, files: TestResultFiles[]) {
  for (const file of readdirSync(dirPath)) {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      files = findAllTestResultFiles(filePath, files);
    } else {
      // Only the test result files, which are XML with the .xml extension, should be discovered.
      if (extname(file) === '.xml') {
        files.push([filePath, join(dirPath, 'test.cache_status')]);
      }
    }
  }
  return files;
}

export function copyTestResultFiles() {
  /** Total number of files copied, also used as a index to number copied files. */
  let copiedFileCount = 0;
  /** The absolute path to the directory containing test logs from bazel tests. */
  const testLogsDir = bazel('info', ['bazel-testlogs']);
  /** List of test result files. */
  const testResultPaths = findAllTestResultFiles(testLogsDir, []);
  /** The full path to the root of the repository base. */
  const projectBaseDir = GitClient.get().baseDir;
  /**
   * Absolute path to a directory to contain the JUnit test result files.
   *
   * Note: The directory created needs to contain a subdirectory which contains the test results in
   * order for CircleCI to properly discover the test results.
   */
  const destDirPath = join(projectBaseDir, 'test-results/_');

  // Ensure that an empty directory exists to contain the test results reports for upload.
  rmSync(destDirPath, {recursive: true, force: true});
  mkdirSync(destDirPath, {recursive: true});

  // By always uploading at least one result file, CircleCI will understand that a tests actions were
  // called for in the bazel test run, even if not tests were actually executed due to cache hits. By
  // always making sure to upload at least one test result report, CircleCI always include the
  // workflow in its aggregated data and provide better metrics about the number of executed tests per
  // run.
  writeFileSync(join(destDirPath, `results.xml`), baseTestReport);
  debug('Added base test report to test-results directory.');

  // Copy each of the test result files to the central test result directory which CircleCI discovers
  // test results in.
  testResultPaths.forEach(([xmlFilePath, cacheStatusFilePath]) => {
    const shortFilePath = xmlFilePath.substr(testLogsDir.length + 1);
    const testResultData = TestResultData.decode(readFileSync(cacheStatusFilePath));

    if (testResultData.remotelyCached && testResultData.testPassed) {
      debug(`Skipping copy of ${shortFilePath} as it was a passing remote cache hit`);
    } else {
      const destFilePath = join(destDirPath, `results-${copiedFileCount++}.xml`);
      copyFileSync(xmlFilePath, destFilePath);
      debug(`Copying ${shortFilePath}`);
    }
  });

  info(`Copied ${copiedFileCount} test result file(s) for upload.`);
}
