/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {element, By, browser} from 'protractor';
import {runBenchmark} from '../../driver-utilities/index';

describe('app performance', () => {
  it('should change text when pressing the button', async () => {
    await browser.get('/');

    const button = element(By.css('button'));
    expect(await button.getText()).toBe('Hello');

    await button.click();
    expect(await button.getText()).toBe('New');
  });

  it('should measure pressing on the button', async () => {
    await runBenchmark({
      id: 'button-press',
      work: () => element(By.css('button')).click(),
    });
  });
});
