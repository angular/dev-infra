import {puppeteerLauncher} from '@web/test-runner-puppeteer';
import {jasmineTestRunnerConfig} from 'web-test-runner-jasmine';
import findAvailablePort from 'get-port';
import {fromRollup} from '@web/dev-server-rollup';
import rollupVirtual from '@rollup/plugin-virtual';
import fs from 'node:fs/promises';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const chromeHeadlessBin = process.env.CHROME_HEADLESS_BIN;
const firefoxBin = process.env.FIREFOX_BIN;
const manualMode = process.env.MANUAL_MODE === '1';

if (!chromeHeadlessBin && !firefoxBin && !manualMode) {
  throw new Error('No browser/mode detected.');
}

const virtual = fromRollup(rollupVirtual);

/** @type {import("@web/test-runner").TestRunnerConfig} */
export default {
  ...jasmineTestRunnerConfig(),
  testFramework: {
    config: {
      seed: process.env.JASMINE_RANDOM_SEED || String(Math.random()).slice(-5),
    },
  },
  watch: false,
  testsFinishTimeout: 1000 * 60 * 5, // 5 minutes
  browserStartTimeout: 1000 * 60 * 1, // 1 minute
  nodeResolve: false,
  concurrency: 1,
  concurrentBrowsers: 1,
  staticLogging: true,
  debug: process.env['DEBUG'] !== undefined,
  manual: manualMode,
  // Note: Only prefer a specific port in manual mode. Otherwise we risk race conditions
  // where multiple processes attempt the "preferred port" at the same time.
  port: await findAvailablePort({port: manualMode ? 9876 : undefined}),
  plugins: [
    virtual({
      '@web/test-runner-core/browser/session.js': await fs.readFile(
        join(
          dirname(fileURLToPath(import.meta.url)),
          '../node_modules/@web/test-runner-core/browser/session.js',
        ),
        'utf8',
      ),
    }),
  ],
  browsers: [
    puppeteerLauncher({
      concurrency: 1,
      launchOptions: {
        executablePath: firefoxBin ? await fs.realpath(firefoxBin) : chromeHeadlessBin,
        browser: firefoxBin ? 'firefox' : 'chrome',
        args: chromeHeadlessBin
          ? [
              '--no-sandbox',
              '--no-default-browser-check',
              '--no-first-run',
              '--disable-default-apps',
              '--disable-popup-blocking',
              '--disable-translate',
              '--disable-background-timer-throttling',
            ]
          : ['--disable-sandbox', '--no-remote'],
        headless: chromeHeadlessBin ? 'shell' : true,
        env: {
          // Needed as otherwise Firefox would try write/read from sandbox protected HOME directory.
          HOME: process.env.TEST_TMPDIR,
          PROFILE: process.env.TEST_TMPDIR,
        },
      },
    }),
  ],
};
