/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {green, Log, yellow} from '../../utils/logging.js';

import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {GithubRepo} from '../../utils/git/github.js';
import {Prompt} from '../../utils/prompt.js';

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
    !(await Prompt.confirm(
      'Do you also want to update your fork(s) on Github to `main`? (recommended)',
    ))
  ) {
    return;
  }

  Log.info('');
  Log.info(yellow('In order to be able to update your fork automatically, the script needs'));
  Log.info(yellow('authenticated access to your GitHub account. For this, you need to enter a'));
  Log.info(
    yellow('GitHub access token that is temporarily stored in memory until the script exits.'),
  );
  Log.info('');

  if (!(await Prompt.confirm('Do you want to proceed updating your forks automatically?'))) {
    return;
  }

  Log.info('');
  Log.info(yellow('You can create an access token by visiting the following GitHub URL:'));
  Log.info(
    yellow(
      'https://github.com/settings/tokens/new?scopes=public_repo&description=ForkBranchRename',
    ),
  );

  const accessToken = await Prompt.input(
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
    Log.warn('Could not find any forks associated with the provided access token.');
    Log.warn('You will need to manually rename the `master` branch to `main` for your fork.');
    return;
  }

  for (const fork of forks) {
    const forkApiParams = {owner: fork.owner, repo: fork.name};

    Log.debug(`Updating fork: ${fork.description}`);

    try {
      await git.github.repos.renameBranch({...forkApiParams, branch: 'master', new_name: 'main'});
      await git.github.repos.update({...forkApiParams, default_branch: 'main'});
      Log.debug(`Successfully updated the fork: ${fork.description}`);
    } catch (e) {
      Log.debug(
        `An error occurred while renaming the default branch for fork: ${fork.description}`,
      );
      failedForks.push(fork.description);
    }
  }

  if (failedForks.length > 0) {
    Log.warn('Could not update the following forks automatically:', failedForks.join(', '));
    Log.warn('You will need to manually rename the `master` branch to `main` in the UI.');
    return;
  }

  Log.info('');
  Log.info(green('---------------------------------------------------------'));
  Log.info(green('Successfully updated your fork(s) from `master` to `main`.'));
  forks.forEach((fork) => Log.info(green(`→ ${fork.description}`)));
  Log.info(green('---------------------------------------------------------'));
}

/** Gets a human-readable description for a given Github repo instance. */
function getDescriptionForRepo(repo: GithubRepo) {
  return `${repo.owner}/${repo.name}`;
}
