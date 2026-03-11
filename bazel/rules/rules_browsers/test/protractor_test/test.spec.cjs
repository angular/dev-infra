const {By} = require('protractor');
const {browser} = require('protractor');

describe('protractor test', () => {
  it('should work', async () => {
    browser.waitForAngularEnabled(false);
    await browser.get('');
    expect(await browser.findElement(By.css('body')).getText()).toBe('Hello World!');
  });
});
