/**
 * @license
 * Copyright Google LLC
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, getConfig} from '../../utils/config';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {setRepoMergeMode} from '../../utils/git/repository-merge-mode';
import {green, Log, red, bold} from '../../utils/logging';

export async function setMergeModeRelease() {
  try {
    await setRepoReleaserTeamToOnlyCurrentUser();
    await setRepoMergeMode('release');
    Log.info(green('  ✔  Repository is set for release'));
  } catch (err) {
    Log.error('  ✘  Failed to setup of repository for release');
    if (err instanceof Error) {
      Log.info(err.message);
      Log.debug(err.stack);
      return;
    }
    Log.info(err);
  }
}

async function setRepoReleaserTeamToOnlyCurrentUser() {
  /** The authenticated GitClient instance. */
  const git = await AuthenticatedGitClient.get();
  /** Caretaker specific configuration. */
  const config = await getConfig([assertValidGithubConfig]);
  /** The github team name for the group containing the repository releaser. */
  const group = `${config.github.name}-releaser`;
  /** The user currently authenticated to github. */
  const login = await git.github.users.getAuthenticated().then(({data}) => data.login);
  /**
   * The membership role, if any for the current user in the releaser group. A maintainer role
   * is required to be able to modify the membership of the group.
   */
  const membership = await git.github.teams
    .getMembershipForUserInOrg({
      org: git.remoteConfig.owner,
      team_slug: group,
      username: login,
    })
    .then(
      ({data}) => data.role,
      () => undefined,
    );

  if (membership !== 'maintainer') {
    Log.info(`Unable to update membership in ${bold(group)}`);
    Log.info(`Please reach out to dev-infra for assistance.`);
    throw '';
  }

  /** A list of the current members of the releaser group */
  const members = new Set(
    await git.github.teams
      .listMembersInOrg({
        org: git.remoteConfig.owner,
        team_slug: group,
      })
      .then(({data}) => data.map(({login}) => login)),
  );

  Log.debug(`Current membership for ${group}:`);
  for (const member of members) {
    Log.debug(`  - ${member}`);
  }

  // Do not remove the current user.
  members.delete(login);

  await Promise.all(
    Array.from(members).map(async (username: string) => {
      // This check should be unnecessary, but is put in place as a second guard
      // against accidently locking all non-admins out of updating the group.
      if (username === login) {
        return;
      }
      await git.github.teams.removeMembershipForUserInOrg({
        org: git.remoteConfig.owner,
        team_slug: group,
        username,
      });
      Log.debug(`Removed ${username} from ${group}.`);
    }),
  );
}
