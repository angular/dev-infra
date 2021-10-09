/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {debug} from './debug';
import {runfiles} from '@bazel/runfiles';

// Exposing the runfiles to keep the Bazel-specific code local to this file.
export {runfiles};

/**
 * Interface describing a file captured in the Bazel action.
 * https://docs.bazel.build/versions/main/skylark/lib/File.html.
 */
export interface BazelFileInfo {
  /** Execroot-relative path pointing to the file. */
  path: string;
  /** The path of this file relative to its root. e.g. omitting `bazel-out/<..>/bin`. */
  shortPath: string;
}

/** Resolves the specified Bazel file to an absolute disk path. */
export function resolveBazelFile(file: BazelFileInfo): string {
  return runfiles.resolveWorkspaceRelative(file.shortPath);
}

/**
 * Resolves a binary with respect to the runfiles part of this test. An integration
 * test could use a Bazel location substitution within a command. This function ensures
 * that the substituted manifest path is then resolved to an absolute path.
 *
 * e.g. consider a case where a Bazel-built tool, like `$(rootpath @nodejs//:node)` is
 * used as binary for the integration test command. This results in a root-relative
 * path that we try to resolve here (using the runfiles).
 */
export async function resolveBinaryWithRunfiles(binary: string): Promise<string> {
  try {
    const resolved = runfiles.resolveWorkspaceRelative(binary);
    debug(`Resolved ${binary} to ${resolved} using runfile resolution.`);
    return resolved;
  } catch {
    debug(`Unable to resolve ${binary} with respect to runfiles.`);
    return binary;
  }
}
