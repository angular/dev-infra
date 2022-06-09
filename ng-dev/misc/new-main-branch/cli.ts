/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import yargs from 'yargs';

import {assertValidGithubConfig, getConfig} from '../../utils/config';
import {green, Log, yellow} from '../../utils/logging';
import {GitClient} from '../../utils/git/git-client';
import {findAvailableLocalBranchName, getCurrentBranch, hasLocalBranch} from './local-branch';
import {promptForRemoteForkUpdate} from './remote-fork-update';
import {getRemotesForRepo, isAngularOwnedRemote} from './remotes';
import {Prompt} from '../../utils/prompt';

/**
 * Migration command that performs local changes to account for an upstream
 * branch rename from `master` to `main`. More details can be found here:
 *
 * https://docs.google.com/document/d/1nqb94eSIcGuPC0M9Rv7-IeqOiJKzsMnuistHZNeUmAg.
 */
async function handler() {
  const git = GitClient.get();

  // The command cannot operate on the local repository if there are uncommitted changes.
  if (git.hasUncommittedChanges()) {
    Log.error('There are uncommitted changes. Unable to switch to new main branch. Aborting..');
    return;
  }

  const config = getConfig([assertValidGithubConfig]);
  const repoSlug = `${config.github.owner}/${config.github.name}`;

  if (!hasLocalBranch(git, 'master')) {
    Log.error('Local repository does not have a local branch named `master`. Aborting..');
    return;
  }

  if (hasLocalBranch(git, 'main')) {
    Log.warn('The new `main` branch is already fetched locally. In order to run');
    Log.warn('this tool, the `main` branch needs to be non-existent locally.');
    Log.warn('');
    Log.warn('The tool will re-fetch the `main` branch and configure it properly.');

    if (!(await Prompt.confirm('Do you want to proceed and delete the local `main` branch?'))) {
      Log.error('Aborting..');
      return;
    }

    // If we are already on the `main` branch, we cannot delete it without
    // checking out a different branch. We switch to `master` in such a case.
    if (getCurrentBranch(git) === 'main') {
      git.run(['checkout', 'master']);
    }

    git.run(['branch', '-D', 'main']);
  }

  const remotes = getRemotesForRepo(git);
  const angularRemotes = Array.from(remotes.entries()).filter((r) => isAngularOwnedRemote(r[1]));
  const angularRemoteNames = angularRemotes.map(([name]) => name);

  // Usually we expect only a single remote pointing to the Angular-owned Github
  // repository. If there are more, we will just assume the first one to be the primary.
  const primaryRemoteName = angularRemoteNames[0];

  if (angularRemoteNames.length === 0) {
    Log.warn(`Found no remote in repository that points to the \`${repoSlug}\` repository.`);
  }

  Log.info('The following steps will be performed:');
  if (angularRemoteNames.length) {
    Log.info(`  → Remotes (${angularRemoteNames.join(`, `)}) are refreshed.`);
  }
  Log.info(`  → The \`main\` branch is fetched from \`${repoSlug}\`.`);
  Log.info('  → The new `main` branch is checked out.');
  if (primaryRemoteName) {
    Log.info(`  → The new \`main\` branch is linked to the \`${primaryRemoteName}\` remote.`);
  }
  Log.info('  → The old `master` branch is deleted or renamed (you will be prompted).');
  Log.info('  → Remote references to `master` branches in the index are removed.');
  Log.info('');

  if (!(await Prompt.confirm('Do you want to continue?'))) {
    return;
  }

  // Refresh the remote head to account for the new default branch (i.e. `main`).
  for (const remoteName of angularRemoteNames) {
    git.run(['fetch', remoteName]);
    git.run(['remote', 'set-head', remoteName, '-a']);
  }

  // Fetch the `main` remote branch and store it locally as `refs/heads/main`.
  git.run(['fetch', git.getRepoGitUrl(), 'main:main']);

  // Checkout the new main branch so that we can potentially delete it later.
  git.run(['checkout', 'main']);

  // Ensure the local `main` branch has its remote set to an Angular-remote.
  if (primaryRemoteName !== undefined) {
    git.run(['branch', '--set-upstream-to', primaryRemoteName, 'main']);
  }

  // Delete the old `master` branch if desirable, or preserve it if desired.
  if (
    await Prompt.confirm('Are there changes in your local `master` branch that you want to keep?')
  ) {
    const tmpBranch = findAvailableLocalBranchName(git, 'old-master');
    git.run(['branch', '-m', 'master', tmpBranch]);

    Log.info('');
    Log.info(
      yellow(`Renamed local \`master\` branch to \`${tmpBranch}\`, preserving your changes.`),
    );
  } else {
    git.run(['branch', '-D', 'master']);
  }

  // Remove all remote-tracking branches for `master` that could
  // cause `git checkout master` to work due to remote tracking.
  for (const [remoteName] of remotes) {
    git.runGraceful(['update-ref', '-d', `refs/remotes/${remoteName}/master`]);
  }

  Log.info('');
  Log.info(green('---------------------------------------------------------'));
  Log.info(green('Successfully updated the local repository to use `main`.'));
  Log.info(green('---------------------------------------------------------'));
  Log.info('');
  Log.info('');

  await promptForRemoteForkUpdate();
}

export const NewMainBranchCommandModule: yargs.CommandModule = {
  handler,
  command: 'new-main-branch',
  describe: 'Updates the local repository to account for the new GitHub main branch.',
};
