/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertValidGithubConfig, getConfig} from '../../utils/config';
import {error, green, info, promptConfirm, red, warn, yellow} from '../../utils/console';
import {findAvailableLocalBranchName, hasLocalBranch} from './find-local-branch';
import {getRemotesForRepo, isAngularOwnedRemote} from './remotes';

import {CommandModule} from 'yargs';
import {GitClient} from '../../utils/git/git-client';
import {promptForRemoteForkUpdate} from './remote-fork-update';

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
    error(red('There are uncommitted changes. Unable to switch to new main branch. Aborting..'));
    return;
  }

  const config = getConfig([assertValidGithubConfig]);
  const repoSlug = `${config.github.owner}/${config.github.name}`;

  if (config.github.mainBranchName !== 'main') {
    error(red('Current project is not part of the default branch renaming.'));
    return;
  }

  if (!hasLocalBranch(git, 'master')) {
    error(red('Local repository does not have a local branch named `master`. Aborting..'));
    return;
  }

  if (hasLocalBranch(git, 'main')) {
    error(red('Local repository already has a branch named `main`. Aborting..'));
    return;
  }

  const remotes = getRemotesForRepo(git);
  const angularRemotes = Array.from(remotes.entries()).filter((r) => isAngularOwnedRemote(r[1]));
  const angularRemoteNames = angularRemotes.map(([name]) => name);

  // Usually we expect only a single remote pointing to the Angular-owned Github
  // repository. If there are more, we will just assume the first one to be the primary.
  const primaryRemoteName = angularRemoteNames[0];

  if (angularRemoteNames.length === 0) {
    warn(yellow(`Found no remote in repository that points to the \`${repoSlug}\` repository.`));
  }

  info('The following steps will be performed:');
  if (angularRemoteNames.length) {
    info(`  → Remotes (${angularRemoteNames.join(`, `)}) are refreshed.`);
  }
  info(`  → The \`main\` branch is fetched from \`${repoSlug}\`.`);
  info('  → The new `main` branch is checked out.');
  if (primaryRemoteName) {
    info(`  → The new \`main\` branch is linked to the \`${primaryRemoteName}\` remote.`);
  }
  info('  → The old `master` branch is deleted or renamed (you will be prompted).');
  info('  → Remote references to `master` branches in the index are removed.');
  info('');

  if (!(await promptConfirm('Do you want to continue?'))) {
    return;
  }

  // Refreshing Angular-owned remotes.
  git.run(['fetch', ...angularRemoteNames]);

  // Refresh the remote head to account for the new default branch (i.e. `main`).
  for (const remoteName of angularRemoteNames) {
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
    await promptConfirm('Are there changes in your local `master` branch that you want to keep?')
  ) {
    const tmpBranch = findAvailableLocalBranchName(git, 'old-master');
    git.run(['branch', '-m', 'master', tmpBranch]);

    info('');
    info(yellow(`Renamed local \`master\` branch to \`${tmpBranch}\`, preserving your changes.`));
  } else {
    git.run(['branch', '-D', 'master']);
  }

  // Remove all remote-tracking branches for `master` that could
  // cause `git checkout master` to work due to remote tracking.
  for (const [remoteName] of remotes) {
    git.runGraceful(['update-ref', '-d', `refs/remotes/${remoteName}/master`]);
  }

  info('');
  info(green('---------------------------------------------------------'));
  info(green('Successfully updated the local repository to use `main`.'));
  info(green('---------------------------------------------------------'));
  info('');
  info('');

  await promptForRemoteForkUpdate();
}

export const NewMainBranchCommandModule: CommandModule = {
  handler,
  command: 'new-main-branch',
  describe: 'Updates the local repository to account for the new GitHub main branch.',
};
