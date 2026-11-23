/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import which from 'which';

/** Non-existent absolute sentinel directory used when every `PATH` entry was stripped. */
export function getEmptyPathSentinel(platform: NodeJS.Platform = process.platform): string {
  return platform === 'win32' ? 'C:\\__ng_dev_empty_path__' : '/__ng_dev_empty_path__';
}

/**
 * Walks upward from `startDir` to locate an enclosing Git working tree root (a directory
 * containing a `.git` directory or worktree file) without spawning a child process.
 */
export function findEnclosingGitRepoRoot(
  startDir: string,
  pathImpl: path.PlatformPath = path,
  existsFn: (p: string) => boolean = fs.existsSync,
): string | null {
  let current = pathImpl.resolve(startDir);
  const {root} = pathImpl.parse(current);

  while (true) {
    if (existsFn(pathImpl.join(current, '.git'))) {
      return current;
    }
    if (current === root) {
      return null;
    }
    const parent = pathImpl.dirname(current);
    if (parent === current) {
      return null;
    }
    current = parent;
  }
}

/**
 * Computes the directories that should be excluded from `PATH` for a subprocess operating in
 * `cwd` (and `processCwd`). When inside a Git working tree, excludes the enclosing repository
 * root so subdirectory invocations still strip `<repoRoot>/node_modules/.bin`. When outside a Git
 * repository, excludes ancestor `node_modules` directories without stripping user home toolchains
 * (such as `~/.nvm` or `~/.local/bin`).
 */
export function getExcludedDirsForCwd(
  cwd?: string | URL,
  processCwd: string = process.cwd(),
  pathImpl: path.PlatformPath = path,
  existsFn: (p: string) => boolean = fs.existsSync,
): string[] {
  const excluded = new Set<string>();
  const resolvedExplicitCwd =
    cwd instanceof URL ? fileURLToPath(cwd) : typeof cwd === 'string' ? cwd : undefined;

  const addForDir = (dir: string, includeBareDirWhenOutsideRepo: boolean) => {
    const resolvedDir = pathImpl.resolve(dir);
    const repoRoot = findEnclosingGitRepoRoot(resolvedDir, pathImpl, existsFn);
    if (repoRoot !== null) {
      excluded.add(repoRoot);
      excluded.add(resolvedDir);
      return;
    }

    if (includeBareDirWhenOutsideRepo) {
      excluded.add(resolvedDir);
    }

    let current = resolvedDir;
    const {root} = pathImpl.parse(current);
    while (true) {
      excluded.add(pathImpl.join(current, 'node_modules'));
      if (current === root) {
        break;
      }
      const parent = pathImpl.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }
  };

  addForDir(processCwd, false);
  if (resolvedExplicitCwd !== undefined) {
    addForDir(resolvedExplicitCwd, true);
  }

  return Array.from(excluded);
}

/**
 * Resolves a path by canonicalizing its deepest existing ancestor directory via `realpathSync`
 * and appending any remaining non-existent path segments.
 */
export function resolvePathWithExistingAncestor(
  targetPath: string,
  pathImpl: path.PlatformPath = path,
  realpathFn: (p: string) => string = fs.realpathSync.native,
): string {
  const resolved = pathImpl.resolve(targetPath);
  const {root} = pathImpl.parse(resolved);
  const trailingSegments: string[] = [];
  let current = resolved;

  while (true) {
    try {
      const realCurrent = realpathFn(current);
      return trailingSegments.length > 0
        ? pathImpl.join(realCurrent, ...trailingSegments)
        : realCurrent;
    } catch {
      if (current === root) {
        return resolved;
      }
      const parent = pathImpl.dirname(current);
      if (parent === current) {
        return resolved;
      }
      trailingSegments.unshift(pathImpl.basename(current));
      current = parent;
    }
  }
}

function normalizePathComparisonValue(value: string, platform: NodeJS.Platform): string {
  return platform === 'win32' || platform === 'darwin'
    ? value.normalize('NFC').toLowerCase()
    : value;
}

function resolveComparisonRoots(
  rootDir: string,
  pathImpl: path.PlatformPath,
  platform: NodeJS.Platform,
  realpathFn: (p: string) => string,
): string[] {
  const logicalRoot = normalizePathComparisonValue(pathImpl.resolve(rootDir), platform);
  const canonicalRoot = normalizePathComparisonValue(
    resolvePathWithExistingAncestor(rootDir, pathImpl, realpathFn),
    platform,
  );
  return Array.from(new Set([logicalRoot, canonicalRoot])).filter(
    (root) => root !== normalizePathComparisonValue(pathImpl.parse(root).root, platform),
  );
}

function isAbsoluteSearchPathSegment(segment: string, platform: NodeJS.Platform): boolean {
  if (platform === 'win32') {
    // Reject drive-relative (`C:foo`) and root-relative (`\foo`) paths on Windows.
    return /^[a-zA-Z]:[\\/]/.test(segment) || segment.startsWith('\\\\');
  }
  return path.posix.isAbsolute(segment);
}

/**
 * Determines whether `candidatePath` resolves to `rootDir` or a location inside `rootDir`,
 * checking both logical (`path.resolve`) and canonical (`realpathSync.native`) representations.
 */
export function isPathInsideDirectory(
  candidatePath: string,
  rootDir: string,
  platform: NodeJS.Platform = process.platform,
  realpathFn: (p: string) => string = fs.realpathSync.native,
): boolean {
  const pathImpl = platform === 'win32' ? path.win32 : path.posix;
  const roots = resolveComparisonRoots(rootDir, pathImpl, platform, realpathFn);

  if (roots.length === 0) {
    return false;
  }

  const logicalCandidate = normalizePathComparisonValue(pathImpl.resolve(candidatePath), platform);
  const canonicalCandidate = normalizePathComparisonValue(
    resolvePathWithExistingAncestor(candidatePath, pathImpl, realpathFn),
    platform,
  );
  const candidates = [logicalCandidate, canonicalCandidate];

  return roots.some((root) =>
    candidates.some(
      (candidate) => candidate === root || candidate.startsWith(`${root}${pathImpl.sep}`),
    ),
  );
}

/**
 * Filters a `PATH` string to remove empty entries, relative entries, and entries resolving
 * inside any of the `excludedDirs`.
 */
export function sanitizePathString(
  pathValue: string,
  excludedDirs: readonly string[],
  platform: NodeJS.Platform = process.platform,
  realpathFn: (p: string) => string = fs.realpathSync.native,
): string {
  const pathImpl = platform === 'win32' ? path.win32 : path.posix;
  const excludedRootList = excludedDirs.flatMap((dir) =>
    resolveComparisonRoots(dir, pathImpl, platform, realpathFn),
  );

  const keptSegments: string[] = [];
  for (const rawSegment of pathValue.split(pathImpl.delimiter)) {
    // Windows UCRT and cmd.exe strip embedded double quotes when searching PATH, whereas on
    // POSIX double quotes are literal filename characters.
    const segment = platform === 'win32' ? rawSegment.replace(/"/g, '') : rawSegment;

    if (segment.trim() === '') {
      continue;
    }
    if (!isAbsoluteSearchPathSegment(segment, platform)) {
      continue;
    }

    if (excludedRootList.length > 0) {
      const logicalCandidate = normalizePathComparisonValue(pathImpl.resolve(segment), platform);
      const canonicalCandidate = normalizePathComparisonValue(
        resolvePathWithExistingAncestor(segment, pathImpl, realpathFn),
        platform,
      );
      const candidates = [logicalCandidate, canonicalCandidate];
      const isExcluded = excludedRootList.some((root) =>
        candidates.some(
          (candidate) => candidate === root || candidate.startsWith(`${root}${pathImpl.sep}`),
        ),
      );
      if (isExcluded) {
        continue;
      }
    }

    keptSegments.push(segment);
  }

  return keptSegments.join(pathImpl.delimiter);
}

/**
 * Returns a shallow copy of `env` with `PATH` keys sanitized to exclude empty, relative, and
 * `excludedDirs`-contained entries, substituting a non-existent sentinel directory if empty.
 */
export function sanitizeEnvironmentPath(
  env: NodeJS.ProcessEnv,
  excludedDirs: readonly string[],
  platform: NodeJS.Platform = process.platform,
  realpathFn: (p: string) => string = fs.realpathSync.native,
): NodeJS.ProcessEnv {
  const sanitizedEnv: NodeJS.ProcessEnv = {...env};
  sanitizeProcessEnvironmentPath(excludedDirs, sanitizedEnv, platform, realpathFn);
  return sanitizedEnv;
}

/**
 * Mutates `targetEnv` (defaulting to `process.env`) in place to remove empty, relative, and
 * `excludedDirs`-contained entries from `PATH` keys, substituting a non-existent sentinel
 * directory when all entries are stripped so libc/shells never fall back to `.`.
 */
export function sanitizeProcessEnvironmentPath(
  excludedDirs: readonly string[],
  targetEnv: NodeJS.ProcessEnv = process.env,
  platform: NodeJS.Platform = process.platform,
  realpathFn: (p: string) => string = fs.realpathSync.native,
): void {
  if (platform === 'win32') {
    targetEnv['NoDefaultCurrentDirectoryInExePath'] = '1';
  }

  const emptySentinel = getEmptyPathSentinel(platform);
  let foundPathKey = false;
  for (const key of Object.keys(targetEnv)) {
    if (/^path$/i.test(key) && typeof targetEnv[key] === 'string') {
      foundPathKey = true;
      const sanitized = sanitizePathString(targetEnv[key]!, excludedDirs, platform, realpathFn);
      targetEnv[key] = sanitized || emptySentinel;
    }
  }

  if (!foundPathKey) {
    targetEnv['PATH'] = emptySentinel;
  }
}

/**
 * Extracts the active `PATH` value from an environment object, using exact `PATH` on POSIX and
 * the last case-insensitive `Path` key on Windows (matching libuv's environment block semantics).
 */
export function getPathFromEnvironment(
  env: NodeJS.ProcessEnv,
  platform: NodeJS.Platform = process.platform,
): string {
  if (platform !== 'win32') {
    return typeof env['PATH'] === 'string' ? env['PATH'] : '';
  }

  const keys = Object.keys(env);
  for (let i = keys.length - 1; i >= 0; i--) {
    const key = keys[i];
    if (/^path$/i.test(key) && typeof env[key] === 'string') {
      return env[key]!;
    }
  }
  return '';
}

/**
 * Resolves `command` to an absolute executable path from `env`'s sanitized `PATH`, guaranteeing
 * that no candidate inside `excludedDirs` is ever returned.
 */
export function resolveSafeExecutable(
  command: string,
  env: NodeJS.ProcessEnv,
  excludedDirs: readonly string[],
  platform: NodeJS.Platform = process.platform,
  realpathFn: (p: string) => string = fs.realpathSync.native,
): string | null {
  const sanitizedEnv = sanitizeEnvironmentPath(env, excludedDirs, platform, realpathFn);
  const sanitizedPath = getPathFromEnvironment(sanitizedEnv, platform);
  if (!sanitizedPath || sanitizedPath === getEmptyPathSentinel(platform)) {
    return null;
  }

  const candidates = which.sync(command, {
    path: sanitizedPath,
    nothrow: true,
    all: true,
  });

  if (candidates === null) {
    return null;
  }

  const safeCandidate = candidates.find(
    (candidate) =>
      !excludedDirs.some((dir) => isPathInsideDirectory(candidate, dir, platform, realpathFn)),
  );
  return safeCandidate ?? null;
}
