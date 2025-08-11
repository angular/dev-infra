import { createRequire } from 'node:module';globalThis['require'] ??= createRequire(import.meta.url);

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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibGliL2luamVjdC1hcnRpZmFjdC1tZXRhZGF0YS50cyIsICIuLi9jb25zdGFudHMudHMiXSwKICAibWFwcGluZ3MiOiAiOzs7QUFpQkEsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sUUFBUTs7O0FDVlIsSUFBTSxtQkFBbUI7RUFDOUIsZUFBZTtFQUNmLGtCQUFrQjs7OztBRFlwQixlQUFlLE9BQU87QUFDcEIsUUFBTSxDQUFDLGVBQWUsVUFBVSxhQUFhLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQztBQUVyRSxRQUFNLEdBQUcsU0FBUyxVQUFVLEtBQUssS0FBSyxlQUFlLGlCQUFpQixhQUFhLENBQUMsR0FBRyxRQUFRO0FBQy9GLFFBQU0sR0FBRyxTQUFTO0FBQUEsSUFDaEIsS0FBSyxLQUFLLGVBQWUsaUJBQWlCLGdCQUFnQixDQUFDO0FBQUEsSUFDM0Q7QUFBQSxFQUNGO0FBQ0Y7QUFFQSxJQUFJO0FBQ0YsUUFBTSxLQUFLO0FBQ2IsU0FBUyxHQUFHO0FBQ1YsVUFBUSxNQUFNLENBQUM7QUFDZixVQUFRLEtBQUssQ0FBQztBQUNoQjsiLAogICJuYW1lcyI6IFtdCn0K
