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
        // use a high version that would cause the linking process to fail due to
        // an unknown version. We expect the bundling to still work though since
        // we set the handling to `ignore` using `linker_unknown_declaration_handling`.
        minVersion: '9999999999999.0.0',
        type: TestCmp,
        selector: 'test',
        ngImport: core,
        template: `<span>Test template</span>`,
      } as any);
    }).not.toThrow();
  });
});
