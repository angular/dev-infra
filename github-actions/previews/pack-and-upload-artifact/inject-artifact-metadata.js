// github-actions/previews/pack-and-upload-artifact/lib/inject-artifact-metadata.ts
import path from "path";
import fs from "fs";

// github-actions/previews/constants.js
var artifactMetadata = {
  "pull-number": "./__metadata__pull_number.txt",
  "build-revision": "./__metadata__build_revision.txt"
};

// github-actions/previews/pack-and-upload-artifact/lib/inject-artifact-metadata.ts
async function main() {
  const [deployDirPath, prNumber, buildRevision] = process.argv.slice(2);
  await fs.promises.writeFile(path.join(deployDirPath, artifactMetadata["pull-number"]), prNumber);
  await fs.promises.writeFile(
    path.join(deployDirPath, artifactMetadata["build-revision"]),
    buildRevision
  );
}
try {
  await main();
} catch (e) {
  console.error(e);
  process.exit(1);
}
/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibGliL2luamVjdC1hcnRpZmFjdC1tZXRhZGF0YS50cyIsICIuLi9jb25zdGFudHMudHMiXSwKICAibWFwcGluZ3MiOiAiO0FBaUJBLE9BQU8sVUFBVTtBQUNqQixPQUFPLFFBQVE7OztBQ1ZSLElBQU0sbUJBQW1CO0VBQzlCLGVBQWU7RUFDZixrQkFBa0I7Ozs7QURZcEIsZUFBZSxPQUFPO0FBQ3BCLFFBQU0sQ0FBQyxlQUFlLFVBQVUsYUFBYSxJQUFJLFFBQVEsS0FBSyxNQUFNLENBQUM7QUFFckUsUUFBTSxHQUFHLFNBQVMsVUFBVSxLQUFLLEtBQUssZUFBZSxpQkFBaUIsYUFBYSxDQUFDLEdBQUcsUUFBUTtBQUMvRixRQUFNLEdBQUcsU0FBUztBQUFBLElBQ2hCLEtBQUssS0FBSyxlQUFlLGlCQUFpQixnQkFBZ0IsQ0FBQztBQUFBLElBQzNEO0FBQUEsRUFDRjtBQUNGO0FBRUEsSUFBSTtBQUNGLFFBQU0sS0FBSztBQUNiLFNBQVMsR0FBRztBQUNWLFVBQVEsTUFBTSxDQUFDO0FBQ2YsVUFBUSxLQUFLLENBQUM7QUFDaEI7IiwKICAibmFtZXMiOiBbXQp9Cg==
