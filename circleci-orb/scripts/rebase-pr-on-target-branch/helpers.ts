/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {execSync as execSync_} from 'child_process';
import {getRefFromBranchList} from './ref-branch-list';

/** Synchronously executes the command, suppressing errors as empty string outputs. */
export function exec(command: string): string {
  try {
    return execSync_(command, {stdio: 'pipe', encoding: 'utf8'}).trim();
  } catch (err: unknown) {
    return '';
  }
}

/**
 * Get the list of branches which contain the provided sha, sorted in descending
 * order by committerdate.
 *
 * example:
 *   upstream/main
 *   upstream/9.0.x
 *   upstream/test
 *   upstream/1.1.x
 */
export function getBranchListForSha(sha: string, remote: string) {
  return exec(`git branch -r '${remote}/*' --sort=-committerdate --contains ${sha}`);
}

/** Get the common ancestor sha of the two provided shas. */
export function getCommonAncestorSha(sha1: string, sha2: string) {
  return exec(`git merge-base ${sha1} ${sha2}`);
}

/** * Adds the remote to git, if it doesn't already exist. */
export function addAndFetchRemote(owner: string, name: string) {
  const remoteName = `${owner}_${name}`;
  exec(`git remote add ${remoteName} https://github.com/${owner}/${name}.git`);
  exec(`git fetch ${remoteName}`);
  return remoteName;
}

/** Get the full sha of the ref provided. */
export function getShaFromRef(ref: string) {
  return exec(`git rev-parse ${ref}`);
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
