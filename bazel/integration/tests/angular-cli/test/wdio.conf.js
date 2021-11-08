exports.config = {
  specs: [__dirname + '/specs/**/*.ts'],
  capabilities: [
    {
      browserName: 'chrome',
      'goog:chromeOptions': {
        // Allows us to use Chromium provided by Bazel.
        binary: process.env.CHROME_BIN,
        // Needed so that the tests can run headless within Bazel and its sandbox.
        args: ['--headless', '--no-sandbox', '--disable-gpu'],
      },
    },
  ],
  services: [
    [
      'chromedriver',
      {
        // Allows us to use the chromedriver path provided by Bazel.
        chromedriverCustomPath: process.env.CHROMEDRIVER_PATH,
      },
    ],
  ],
  logLevel: 'warn',
  baseUrl: 'http://localhost',
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  framework: 'jasmine',
  reporters: ['spec'],
  jasmineOpts: {
    defaultTimeoutInterval: 60000,
  },
  autoCompileOpts: {
    tsNodeOpts: {
      project: __dirname + '/specs/tsconfig.json',
    },
  },
};
