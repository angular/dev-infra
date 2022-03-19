const assert = require('assert');

/**  Files exposed through the `extract_types` target are passed as arguments. */
const typeRootpaths = process.argv.slice(2);

assert.deepStrictEqual(typeRootpaths, [
  // TypeScript types transitively added to every `ts_library` target. This might be
  // cleaned up in the future, but is captured in this test as it rarely should change.
  '../npm/node_modules/typescript/lib/protocol.d.ts',
  '../npm/node_modules/typescript/lib/tsserverlibrary.d.ts',
  '../npm/node_modules/typescript/lib/typescript.d.ts',
  '../npm/node_modules/typescript/lib/typescriptServices.d.ts',
  // Actual workspace-local `d.ts` files.
  'bazel/test/fixture.d.ts',
  'bazel/test/transitive_file.d.ts',
]);
