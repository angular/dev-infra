/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {debug, green, promptConfirm, promptInput, warn, yellow} from '../../utils/console';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {GithubRepo} from '../../utils/git/github';
import {info} from 'console';

/**
 * Prompts the user whether remote forks for the current repository should be
 * updated from `master` to `main`.
 *
 * An access token for performing the Github Admin operation is demanded through
 * a prompt. This is opt-in as not every contributor may want to grant the tool a
 * Github access token/or some contributors may want to make the changes themselves.
 */
export async function promptForRemoteForkUpdate() {
  if (
    !(await promptConfirm(
      'Do you also want to update your fork(s) on Github to `main`? (recommended)',
    ))
  ) {
    return;
  }

  info('');
  info(yellow('In order to be able to update your fork automatically, the script needs'));
  info(yellow('authenticated access to your GitHub account. For this, you need to enter a'));
  info(yellow('GitHub access token that is temporarily stored in memory until the script exits.'));
  info('');

  if (!(await promptConfirm('Do you want to proceed updating your forks automatically?'))) {
    return;
  }

  info('');
  info(yellow('You can create an access token by visiting the following GitHub URL:'));
  info(
    yellow(
      'https://github.com/settings/tokens/new?scopes=public_repo&description=ForkBranchRename',
    ),
  );

  const accessToken = await promptInput(
    'Please enter a Github access token (`public_repo` scope is required)',
  );

  // Configure an authenticated Git client.
  AuthenticatedGitClient.configure(accessToken);

  const git = AuthenticatedGitClient.get();
  const forks = (await git.getAllForksOfAuthenticatedUser()).map((fork) => ({
    ...fork,
    description: getDescriptionForRepo(fork),
  }));
  const failedForks: string[] = [];

  if (forks.length === 0) {
    warn(yellow('Could not find any forks associated with the provided access token.'));
    warn(yellow('You will need to manually rename the `master` branch to `main` for your fork.'));
    return;
  }

  for (const fork of forks) {
    const forkApiParams = {owner: fork.owner, repo: fork.name};

    debug(`Updating fork: ${fork.description}`);

    try {
      await git.github.repos.renameBranch({...forkApiParams, branch: 'master', new_name: 'main'});
      await git.github.repos.update({...forkApiParams, default_branch: 'main'});
      debug(`Successfully updated the fork: ${fork.description}`);
    } catch (e) {
      debug(`An error occurred while renaming the default branch for fork: ${fork.description}`);
      failedForks.push(fork.description);
    }
  }

  if (failedForks.length > 0) {
    warn(yellow('Could not update the following forks automatically:', failedForks.join(', ')));
    warn(yellow('You will need to manually rename the `master` branch to `main` in the UI.'));
    return;
  }

  info('');
  info(green('---------------------------------------------------------'));
  info(green('Successfully updated your fork(s) from `master` to `main`.'));
  forks.forEach((fork) => info(green(`→ ${fork.description}`)));
  info(green('---------------------------------------------------------'));
}

/** Gets a human-readable description for a given Github repo instance. */
function getDescriptionForRepo(repo: GithubRepo) {
  return `${repo.owner}/${repo.name}`;
}
