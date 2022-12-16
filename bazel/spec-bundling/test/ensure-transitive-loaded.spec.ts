// Note: This should be overridden by the `should_be_picked_up.spec`.
(global as any).iWillAlwaysFail = true;

describe('some spec no compilation', () => {
  it('should work', () => {
    expect((global as any).iWillAlwaysFail).toBe(false);
  });
});
