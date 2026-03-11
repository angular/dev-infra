import {isSameDigest} from './file_cache/file_cache.mjs';

const resourceFileRegex = /\.(css|html)$/;

export function isResourceFile(filePath: string): boolean {
  return resourceFileRegex.test(filePath);
}

export function diffWorkerInputsForModifiedResources(
  newInputs: Map<string, Uint8Array>,
  oldInputs: Map<string, Uint8Array>,
): Set<string> {
  const result = new Set<string>();
  // Look for inputs that have changed since the last work request.
  // Also incorporate files that are newly available.
  for (const [f, digest] of newInputs.entries()) {
    if (!isResourceFile(f)) {
      continue;
    }
    const lastDigest = oldInputs.get(f);
    if (lastDigest === undefined || !isSameDigest(digest, lastDigest)) {
      result.add(f);
      continue;
    }
    if (!oldInputs.has(f)) {
      result.add(f);
    }
  }
  // Look for deleted resource files. Angular needs to know about these.
  // Otherwise analysis of components relying on such files would be re-used.
  for (const f of oldInputs.keys()) {
    if (!isResourceFile(f)) {
      continue;
    }
    if (!newInputs.has(f)) {
      result.add(f);
    }
  }
  return result;
}
