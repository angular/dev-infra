/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readdirSync, unlinkSync} from 'fs';
import {join} from 'path';
import {Argv, CommandModule} from 'yargs';
import {spawnSync} from '../../utils/child-process';

import {error, info, red} from '../../utils/console';
import {Spinner} from '../../utils/spinner';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {addGithubTokenOption} from '../../utils/git/github-yargs';

async function builder(yargs: Argv) {
  return addGithubTokenOption(yargs);
}

/** Environment object enabling the usage of yarn-path to determine the new version. */
const useYarnPathEnv = {
  ...process.env,
  YARN_IGNORE_PATH: '0',
};

/** Environment object to prevent running husky workflow. */
const skipHuskyEnv = {
  ...process.env,
  HUSKY: '0',
};

async function handler() {
  /** Directory where node binary are globally installed. */
  const npmBinDir = spawnSync('npm', ['bin', '--global', 'yarn']).stdout.trim();
  /** The full path to the globally installed yarn binary. */
  const yarnBin = `${npmBinDir}/yarn`;
  /** Instance of the local git client. */
  const git = AuthenticatedGitClient.get();
  /** The main branch name of the repository. */
  const mainBranchName = git.mainBranchName;
  /** The original branch or ref before the command was invoked. */
  const originalBranchOrRef = git.getCurrentBranchOrRevision();

  if (git.hasUncommittedChanges()) {
    error(red('Found changes in the local repository. Make sure there are no uncommitted files.'));
    process.exitCode = 1;
    return;
  }

  /** A spinner instance. */
  const spinner = new Spinner('');
  try {
    spinner.update(`Fetching the latest primary branch from upstream: "${mainBranchName}"`);
    git.run(['fetch', '-q', git.getRepoGitUrl(), mainBranchName]);
    git.checkout('FETCH_HEAD', false);

    spinner.update('Removing previous yarn version.');
    const yarnReleasesDir = join(git.baseDir, '.yarn/releases');
    readdirSync(yarnReleasesDir).forEach((file) => unlinkSync(join(yarnReleasesDir, file)));

    spinner.update('Updating yarn version.');
    spawnSync(yarnBin, ['policies', 'set-version', 'latest']);

    spinner.update('Confirming the version of yarn was updated.');
    const newYarnVersion = spawnSync(yarnBin, ['-v'], {env: useYarnPathEnv}).stdout.trim();
    if (git.run(['status', '--porcelain']).stdout.length === 0) {
      spinner.complete();
      error(red('Yarn already up to date'));
      process.exitCode = 0;
      return;
    }
    /** The title for the PR. */
    const title = `build: update to yarn v${newYarnVersion}`;
    /** The body for the PR. */
    const body = `Update to the latest version of yarn, ${newYarnVersion}.`;
    /** The commit message for the change. */
    const commitMessage = `${title}\n\n${body}`;
    /** The name of the branch to use on remote. */
    const branchName = `yarn-update-v${newYarnVersion}`;
    /** The name of the owner for remote branch on Github. */
    const {owner: localOwner} = await git.getForkOfAuthenticatedUser();

    spinner.update('Staging yarn vendoring files and creating commit');
    git.run(['add', '.yarn/releases/**', '.yarnrc']);
    git.run(['commit', '-q', '--no-verify', '-m', commitMessage], {env: skipHuskyEnv});

    spinner.update('Pushing commit changes to github.');
    git.run(['push', '-q', 'origin', '--force-with-lease', `HEAD:refs/heads/${branchName}`]);

    spinner.update('Creating a PR for the changes.');
    const {number} = (
      await git.github.pulls.create({
        ...git.remoteParams,
        title,
        body,
        base: mainBranchName,
        head: `${localOwner}:${branchName}`,
      })
    ).data;

    spinner.complete();
    info(`Created PR #${number} to update to yarn v${newYarnVersion}`);
  } catch (e) {
    spinner.complete();
    error(red('Aborted yarn update do to errors:'));
    error(e);
    process.exitCode = 1;
    git.checkout(originalBranchOrRef, true);
  } finally {
    git.checkout(originalBranchOrRef, true);
  }
}

/** CLI command module. */
export const UpdateYarnCommandModule: CommandModule = {
  builder,
  handler,
  command: 'update-yarn',
  describe: 'Automatically update the vendored yarn version in the repository and create a PR',
};
