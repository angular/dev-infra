/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
const {execSync} = require('child_process');
const {join, extname} = require('path');
const {mkdirSync, rmSync, statSync, readdirSync, copyFileSync} = require('fs');

/**
 * Discover all test results, which @bazel/jasmine stores as `test.xml` files, in the directory and
 * return back the list of absolute file paths.
 */
const findTestResultsInDir = function (dirPath, files) {
  for (const file of readdirSync(dirPath)) {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      files = findTestResultsInDir(filePath, files);
    } else {
      // Only the test result files, which are XML with the .xml extension, should be discovered.
      if (extname(file) === '.xml') {
        files.push(filePath);
      }
    }
  }
  return files;
};

/** Absolute path to the bazel instance's testlog directory.  */
const testLogPath = execSync('yarn -s bazel info bazel-testlogs', {
  stdio: 'pipe',
  encoding: 'utf8',
}).trim();
/** List of test result files. */
const testResultPaths = findTestResultsInDir(testLogPath, []);
/**
 * Absolute path to a directory to contain the JUnit test result files.
 *
 * Note: The directory created needs to contain a subdirectory which contains the test results in
 * order for CircleCI to properly discover the test results.
 */
const destDirPath = join(__dirname, '../test-results/jasmine');

// Ensure that an empty directory exists to contain the test results reports for upload.
rmSync(destDirPath, {recursive: true, force: true});
mkdirSync(destDirPath, {recursive: true});

// Copy each of the test result files to the central test result directory which CircleCI discovers
// test results in.
testResultPaths.forEach((filePath, i) => {
  const destFilePath = join(destDirPath, `results-${i}.xml`);
  copyFileSync(filePath, destFilePath);
});
