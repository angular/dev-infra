/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GithubConfig} from '../config.js';
import {spawnSync} from 'child_process';
import {testTmpDir} from './bazel-env.js';

/** Runs a Git command in the temporary repo directory. */
export function runGitInTmpDir(args: string[]): string {
  const result = spawnSync(process.argv[2], args, {cwd: testTmpDir, encoding: 'utf8'});
  if (result.status !== 0) {
    throw Error(`Error for Git command: ${result.stdout} ${result.stderr}`);
  }
  return result.stdout.trim();
}

/** Helper class that can be used to initialize and control the sandbox test repo. */
export class SandboxGitRepo {
  private _nextBranchName = this._github.mainBranchName;
  private _commitShaById = new Map<number, string>();

  static withInitialCommit(github: GithubConfig) {
    return new SandboxGitRepo(github).commit('feat(pkg1): initial commit');
  }

  protected constructor(private _github: GithubConfig) {
    runGitInTmpDir(['init']);
    runGitInTmpDir(['config', 'user.email', 'angular-robot@google.com']);
    runGitInTmpDir(['config', 'user.name', 'Angular Robot']);

    // Note: We cannot use `--initial-branch=` as this Git option is rather
    // new and we do not have a strict requirement on a specific Git version.
    this.branchOff(this._nextBranchName);
    this.commit('feat(pkg1): initial commit');
  }

  /**
   * Creates a commit with the given message. Optionally, an id can be specified to
   * associate the created commit with a shortcut in order to reference it conveniently
   * when writing tests (e.g. when cherry-picking later).
   */
  commit(message: string, id?: number): this {
    // Capture existing files in the temporary directory. e.g. if a changelog
    // file has been written before we want to preserve that in the fake repo.
    runGitInTmpDir(['add', '-A']);
    runGitInTmpDir(['commit', '--allow-empty', '-m', message]);

    if (id !== undefined) {
      const commitSha = runGitInTmpDir(['rev-parse', 'HEAD']);
      this._commitShaById.set(id, commitSha);
    }

    return this;
  }

  /** Branches off the current repository `HEAD`. */
  branchOff(newBranchName: string): this {
    runGitInTmpDir(['checkout', '-B', newBranchName]);
    return this;
  }

  /** Switches to an existing branch. */
  switchToBranch(branchName: string): this {
    runGitInTmpDir(['checkout', branchName]);
    return this;
  }

  /** Creates a new tag for the current repo `HEAD`. */
  createTagForHead(tagName: string): this {
    runGitInTmpDir(['tag', tagName, 'HEAD']);
    return this;
  }

  /** Cherry-picks a commit into the current branch. */
  cherryPick(commitId: number): this {
    runGitInTmpDir(['cherry-pick', '--allow-empty', this.getShaForCommitId(commitId)]);
    return this;
  }

  /** Retrieve the sha for the commit. */
  getShaForCommitId(commitId: number, type: 'long' | 'short' = 'long'): string {
    const commitSha = this._commitShaById.get(commitId);

    if (commitSha === undefined) {
      throw Error('Unable to retrieve SHA due to an unknown commit id.');
    }

    if (type === 'short') {
      return runGitInTmpDir(['rev-parse', '--short', commitSha]);
    }

    return commitSha;
  }
}
