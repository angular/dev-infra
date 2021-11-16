// This is an ESM import that would usually break within `jasmine_node_test` because it
// consumes devmode CommonJS sources and `rules_nodejs` does not support ESM well yet.
import {VERSION} from '@angular/core';
import * as core from '@angular/core';

describe('@angular/core ESM import', () => {
  it('should work', () => {
    expect(VERSION.major).toBeGreaterThanOrEqual(13);
  });

  it('should have run the linker', () => {
    expect(() => {
      class TestCmp {}
      core.ɵɵngDeclareComponent({
        version: '0.0.0',
        minVersion: '12.0.0',
        type: TestCmp,
        selector: 'test',
        ngImport: core,
        template: `<span>Test template</span>`,
      } as any);
    }).not.toThrow();
  });
});
