/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Builder, By, WebDriver} from 'selenium-webdriver';
import {Options as ChromeOptions, ServiceBuilder} from 'selenium-webdriver/chrome';

import waitOn from 'wait-on';
import childProcess from 'node:child_process';
import path from 'node:path';

/**
 * Test script that will start the test http server binary in a background process.
 * Once the server is available and listening, Chromium from `bazel/browsers` is
 * launched through Selenium to ensure that the environment variable inlining,
 * actual resolution of JavaScript resources and `index.html` works as expected.
 */
async function runTest() {
  const [chromiumRootpath, chromedriverRootpath] = process.argv.slice(2);

  // Resolve chromium, chromedriver and the server binary to disk paths.
  const chromiumPath = path.resolve(chromiumRootpath);
  const chromedriverPath = path.resolve(chromedriverRootpath);
  const serverBinPath = path.resolve('bazel/http-server/test/server');

  const serverPort = 1234;
  const serverHost = `127.0.0.1:${serverPort}`;

  // Start test http server in background
  const serverProcess = childProcess.spawn(serverBinPath, ['--port', `${serverPort}`], {
    env: {...process.env, GOOGLE_MAPS_API_KEY: 'myPersonalSecret'},
    stdio: 'inherit',
  });

  console.error('Spawning');

  serverProcess.on('error', (err) => {
    console.error(err);
  });

  // Ensure the process gets killed, if the test terminates early.
  process.on('exit', () => serverProcess.kill());

  // Keep track of potentially launched webdriver instance, so that
  // we can kill it when the test code errors unexpectedly.
  let driver: WebDriver | null = null;

  try {
    // Wait for server to be ready, regardless of status code (404/200 or else)
    await waitOn({
      resources: [`http-get://${serverHost}`],
      timeout: 20_000,
      headers: {
        'accept': 'text/html',
      },
    });

    const service = new ServiceBuilder(chromedriverPath);
    const options = new ChromeOptions();
    options.setChromeBinaryPath(chromiumPath).addArguments('--no-sandbox', '--headless');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();

    await driver.get(`http://${serverHost}`);

    let bodyText = await driver.findElement(By.css('body')).getText();

    // Assert that the variable is inlined, and that the `index.html` renders.
    if (bodyText !== 'Works My key: myPersonalSecret') {
      throw Error(`Unexpected body: ${bodyText}`);
    }

    console.log('Valid text for index file: ', bodyText);

    await driver.get(`http://${serverHost}/not-found.txt`);

    bodyText = await driver.findElement(By.css('body')).getText();

    if (bodyText !== 'Not found - Error 404') {
      throw Error(`Unexpected text when requesting unknown resource: ${bodyText}`);
    }

    console.log('Valid text for unknown resource:', bodyText);
  } finally {
    await driver?.quit();

    // Kill server process if we exit normally (no script termination).
    serverProcess.kill();
  }
}

runTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
