import * as path from 'path';
import {PlaywrightTestConfig} from '@playwright/test';

export const config: PlaywrightTestConfig = {
  projects: [
    {
      name: 'Main tests',
      testDir: path.join(__dirname, 'tests/'),
      use: {
        headless: true,
        launchOptions: {
          args: ['--no-sandbox'],
          executablePath: process.env.CHROME_BIN,
        },
      },
    },
  ],
};

export default config;
