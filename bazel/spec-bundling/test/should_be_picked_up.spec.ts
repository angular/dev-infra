// See `ensure-transitive-loaded` for explanation. This verifies this
// file is actually loaded.
(global as any).iWillAlwaysFail = false;

describe('should be picked up', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
