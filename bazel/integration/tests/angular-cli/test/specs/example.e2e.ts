describe('start page', () => {
  it('should work', async () => {
    await browser.url(`http://localhost:4200`);

    expect(await $('body').getText()).toContain('What do you want to do next with your app?');
  });
});
