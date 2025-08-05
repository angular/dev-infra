const assert = require('assert');

/**  Files exposed through the `extract_types` target are passed as arguments. */
const typeRootpaths = process.argv.slice(2);

assert.deepStrictEqual(typeRootpaths, [
  // Actual workspace-local `d.ts` files.
  'bazel/test/fixture.d.ts',
  'bazel/test/transitive_file.d.ts',
]);
