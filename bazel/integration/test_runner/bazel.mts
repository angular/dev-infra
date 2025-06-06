/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import path from 'node:path';
import assert from 'node:assert';
import {debug} from './debug.mjs';

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

/**
 * Interface describing a Bazel-expanded value, including both location and
 * configuration variable expansion.
 *
 * A integration command for example could use a Bazel location expansion to resolve a
 * binary. Such resolved values are captured in a structure like this.
 */
export interface BazelExpandedValue {
  /** Actual value, with expanded Make expressions if it contained any. */
  value: string;
  /** Whether the value contains an expanded value (either location or variable). */
  containsExpansion: boolean;
}

/** Resolves the specified Bazel file to an absolute disk path. */
export function resolveBazelFile(file: Pick<BazelFileInfo, 'shortPath'>): string {
  // CWD is runfiles root inside workspace. All short paths naturally work.
  return path.join(process.cwd(), file.shortPath);
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
export async function resolveBinaryWithRunfilesGracefully(binary: string): Promise<string> {
  try {
    // CWD is runfiles root inside workspace. All short paths naturally work.
    const resolved = path.join(process.cwd(), binary);
    debug(`Resolved ${binary} to ${resolved} using runfile resolution.`);
    return resolved;
  } catch {
    debug(`Unable to resolve ${binary} with respect to runfiles.`);
    return binary;
  }
}
