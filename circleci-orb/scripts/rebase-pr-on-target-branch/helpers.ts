/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {spawnSync} from 'child_process';
import {getRefFromBranchList} from './ref-branch-list';

/**
 * Synchronously executes the Git command.
 *
 * @throws {Error} Errors will be thrown on non-successful commands.
 */
export function execGit(args: string[]): string {
  const cmd = `git ${args.join(' ')}`;
  const proc = spawnSync('git', args, {shell: true, stdio: 'pipe', encoding: 'utf8'});

  if (proc.error !== undefined) {
    console.error(proc.error);
    throw new Error(`Unexpected error while executing: ${cmd}`);
  }

  if (proc.status !== 0) {
    console.error(`Failed executing: ${cmd}.`);
    console.error(`Status Code: ${proc.status}`);
    console.error(`Stdout: ${proc.stdout}`);
    console.error(`Stderr: ${proc.stdout}`);
    throw new Error(`Unexpected error while executing: ${cmd}`);
  }

  return proc.stdout.trim();
}

/**
 * Get the list of branches which contain the provided sha, sorted in
 * descending order by committerdate.
 *
 * example:
 *   upstream/main
 *   upstream/9.0.x
 *   upstream/test
 *   upstream/1.1.x
 */
export function getBranchListForSha(sha: string, remote: string) {
  return execGit(['branch', '-r', `${remote}/*`, '--sort=-committerdate', '--contains', sha]);
}

/** Get the common ancestor sha of the two provided shas. */
export function getCommonAncestorSha(sha1: string, sha2: string) {
  return execGit(['merge-base', sha1, sha2]);
}

/** * Adds the remote to git, if it doesn't already exist. */
export function addAndFetchRemote(owner: string, name: string) {
  const remoteName = `${owner}_${name}`;
  execGit(['remote', 'add', remoteName, `https://github.com/${owner}/${name}.git`]);
  execGit(['fetch', remoteName]);
  return remoteName;
}

/** Get the full sha of the ref provided. */
export function getShaFromRef(ref: string) {
  return execGit(['rev-parse', ref]);
}

/** Get the ref and latest shas for the provided sha on a specific remote. */
export function lookupSha(sha: string, owner: string, name: string, primaryBranchName: string) {
  const remote = addAndFetchRemote(owner, name);
  // Get the ref on the remote for the sha provided.
  const ref = getRefFromBranchList(getBranchListForSha(sha, remote), primaryBranchName);
  // Get the latest sha on the discovered remote ref.
  const latestSha = getShaFromRef(`${remote}/${ref}`);

  return {remote, ref, latestSha, sha};
}
