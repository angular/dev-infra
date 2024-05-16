import * as path from 'path';
import {test, expect} from '@playwright/test';

const testPageIndex = path.join(__dirname, `../test_page/index.html`);

test('basic test', async ({page}) => {
  await page.goto(`file://${testPageIndex}`);
  const title = page.locator('h1');
  await expect(title).toHaveText('This is a test page');
});
