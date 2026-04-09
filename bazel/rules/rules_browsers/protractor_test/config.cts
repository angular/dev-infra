import {Config} from 'protractor';
import * as path from 'path';
import assert from 'assert';
import * as fs from 'fs';
import {globSync} from 'tinyglobby';

const chromedriverBin = process.env['CHROMEDRIVER_BIN'];
const chromeHeadlessBin = process.env['CHROME_HEADLESS_BIN'];
const testServerPort = process.env['TEST_SERVER_PORT'];
const testPackage = process.env['TEST_PACKAGE'];
const extraUserConfigPath = process.env['CONFIG_PATH'];
const enablePerfLogging = process.env['ENABLE_PERF_LOGGING'] === '1';

assert(chromedriverBin, 'No chromedriver path specified.');
assert(chromeHeadlessBin, 'No chrome headless path specified.');
assert(testServerPort, 'No test server port specified');
assert(testPackage !== undefined, 'No test package specified');

const extraUserConfig =
  extraUserConfigPath !== undefined ? JSON.parse(fs.readFileSync(extraUserConfigPath, 'utf8')) : {};

// Browser artifacts are short paths from a different repository, so
// we need to join them with the current workspace root in the runfiles tree.
const workspaceRoot = path.resolve(__dirname, '../');
const chromedriverPath = path.join(workspaceRoot, chromedriverBin);
const chromeHeadlessPath = path.join(workspaceRoot, chromeHeadlessBin);

const specFiles = globSync(
  [
    '**/*.spec.js',
    '**/*.spec.cjs',
    '**/*.spec.mjs',
    '**/*_spec.js',
    '**/*_spec.cjs',
    '**/*_spec.mjs',
  ],
  {cwd: testPackage, absolute: true},
);

// Define the default capabilities value, and if perf logging is enabled, add perf logging flags.
const capabilities: any = {
  browserName: 'chrome',
  chromeOptions: {
    binary: chromeHeadlessPath,
    args: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  },
};
if (enablePerfLogging) {
  ((capabilities.chromeOptions.perfLoggingPrefs = {
    'traceCategories':
      'v8,blink.console,devtools.timeline,disabled-by-default-devtools.timeline,blink.user_timing',
  }),
    (capabilities.loggingPrefs = {
      performance: 'ALL',
      browser: 'ALL',
    }));
}

export const config: Config = {
  ...extraUserConfig,
  framework: 'jasmine',
  directConnect: true,
  chromeDriver: chromedriverPath,
  specs: specFiles,
  baseUrl: `http://localhost:${testServerPort}`,
  capabilities,
};
