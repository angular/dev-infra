/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {GitClient} from '../../utils/git/git-client.js';
import {Log} from '../../utils/logging.js';

/**
 * Regular expression matching a remote verbose info line, capturing
 * the remote name, remote url and type (for different mirrors).
 *
 * ```
 *   origin  https://github.com/devversion/dev-infra.git (fetch)
 *   origin  https://github.com/devversion/dev-infra.git (push)
 *   upstream        https://github.com/angular/dev-infra.git (fetch)
 *   upstream        https://github.com/angular/dev-infra.git (push)
 * ```
 */
const remoteVerboseInfoRegex = /^([^\s]+)\s+([^\s]+)\s+\((fetch|push)\)$/;

/**
 * Regular expression that matches Git remote SSH/HTTP urls which are referring
 * to a repository that is owned by the Angular Github organization.
 */
const angularOrganizationRemoteUrl = /github.com[:/]angular\//;

/** Type describing extracted remotes, mapping remote name to its URL. */
export type Remotes = Map<string, string>;

/**
 * Gets all remotes for the repository associated with the given Git client.
 *
 * Assumes that both `fetch` and `push` mirrors of a remote have the same URL.
 */
export function getRemotesForRepo(git: GitClient): Remotes {
  const remotesVerboseInfo = git.run(['remote', '--verbose']);
  const remotes: Remotes = new Map();

  for (const line of remotesVerboseInfo.stdout.trim().split(/\r?\n/)) {
    const matches = line.match(remoteVerboseInfoRegex);

    if (matches === null) {
      Log.debug('Could not parse remote info line:', line);
      continue;
    }

    remotes.set(matches[1], matches[2]);
  }

  return remotes;
}

/** Gets whether the given remote URL refers to an Angular-owned repository. */
export function isAngularOwnedRemote(url: string) {
  return angularOrganizationRemoteUrl.test(url);
}
