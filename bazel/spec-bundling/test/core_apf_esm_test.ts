import * as core from '@angular/core';
import '@angular/compiler';

describe('@angular/core ESM import', () => {
  it('should work', () => {
    expect(core.VERSION.major).toBeGreaterThanOrEqual(13);
  });

  it('should have run the linker', () => {
    expect(() => {
      class TestCmp {}
      core.ɵɵngDeclareComponent({
        version: '0.0.0',
        minVersion: '0.0.0',
        type: TestCmp,
        selector: 'test',
        ngImport: core,
        template: `<span>Test template</span>`,
      } as any);
    }).not.toThrow();
  });
});
