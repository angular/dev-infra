import { createRequire as _esbuildBannerCreateRequire } from 'node:module';globalThis['require'] ??= _esbuildBannerCreateRequire(import.meta.url);

// github-actions/previews/pack-and-upload-artifact/lib/inject-artifact-metadata.ts
import path from "path";
import fs from "fs";

// github-actions/previews/constants.js
var artifactMetadata = {
  "pull-number": "./__metadata__pull_number.txt",
  "build-revision": "./__metadata__build_revision.txt"
};

// github-actions/previews/pack-and-upload-artifact/lib/inject-artifact-metadata.ts
async function safeWrite(deployDirPath, metadataKey, content) {
  const fileName = artifactMetadata[metadataKey];
  const targetPath = path.join(deployDirPath, fileName);
  try {
    const stat = await fs.promises.lstat(targetPath);
    if (stat.isSymbolicLink()) {
      throw new Error(`Security violation: metadata file ${targetPath} is a symbolic link.`);
    }
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
  }
  await fs.promises.writeFile(targetPath, content);
}
async function main() {
  const [deployDirPath, prNumber, buildRevision] = process.argv.slice(2);
  try {
    const stat = await fs.promises.lstat(deployDirPath);
    if (stat.isSymbolicLink()) {
      throw new Error(`Security violation: deploy directory ${deployDirPath} is a symbolic link.`);
    }
  } catch (e) {
    if (e.code !== "ENOENT") {
      throw e;
    }
  }
  await safeWrite(deployDirPath, "pull-number", prNumber);
  await safeWrite(deployDirPath, "build-revision", buildRevision);
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibGliL2luamVjdC1hcnRpZmFjdC1tZXRhZGF0YS50cyIsICIuLi9jb25zdGFudHMudHMiXSwKICAibWFwcGluZ3MiOiAiOzs7QUFpQkEsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sUUFBUTs7O0FDVlIsSUFBTSxtQkFBbUI7RUFDOUIsZUFBZTtFQUNmLGtCQUFrQjs7OztBRFlwQixlQUFlLFVBQVUsZUFBdUIsYUFBNEMsU0FBaUI7QUFDM0csUUFBTSxXQUFXLGlCQUFpQixXQUFXO0FBQzdDLFFBQU0sYUFBYSxLQUFLLEtBQUssZUFBZSxRQUFRO0FBRXBELE1BQUk7QUFDRixVQUFNLE9BQU8sTUFBTSxHQUFHLFNBQVMsTUFBTSxVQUFVO0FBQy9DLFFBQUksS0FBSyxlQUFlLEdBQUc7QUFDekIsWUFBTSxJQUFJLE1BQU0scUNBQXFDLFVBQVUsc0JBQXNCO0FBQUEsSUFDdkY7QUFBQSxFQUNGLFNBQVMsR0FBUTtBQUNmLFFBQUksRUFBRSxTQUFTLFVBQVU7QUFDdkIsWUFBTTtBQUFBLElBQ1I7QUFBQSxFQUNGO0FBRUEsUUFBTSxHQUFHLFNBQVMsVUFBVSxZQUFZLE9BQU87QUFDakQ7QUFFQSxlQUFlLE9BQU87QUFDcEIsUUFBTSxDQUFDLGVBQWUsVUFBVSxhQUFhLElBQUksUUFBUSxLQUFLLE1BQU0sQ0FBQztBQUdyRSxNQUFJO0FBQ0YsVUFBTSxPQUFPLE1BQU0sR0FBRyxTQUFTLE1BQU0sYUFBYTtBQUNsRCxRQUFJLEtBQUssZUFBZSxHQUFHO0FBQ3pCLFlBQU0sSUFBSSxNQUFNLHdDQUF3QyxhQUFhLHNCQUFzQjtBQUFBLElBQzdGO0FBQUEsRUFDRixTQUFTLEdBQVE7QUFDZixRQUFJLEVBQUUsU0FBUyxVQUFVO0FBQ3ZCLFlBQU07QUFBQSxJQUNSO0FBQUEsRUFDRjtBQUVBLFFBQU0sVUFBVSxlQUFlLGVBQWUsUUFBUTtBQUN0RCxRQUFNLFVBQVUsZUFBZSxrQkFBa0IsYUFBYTtBQUNoRTtBQUVBLElBQUk7QUFDRixRQUFNLEtBQUs7QUFDYixTQUFTLEdBQUc7QUFDVixVQUFRLE1BQU0sQ0FBQztBQUNmLFVBQVEsS0FBSyxDQUFDO0FBQ2hCOyIsCiAgIm5hbWVzIjogW10KfQo=
