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
import {ChildProcess} from '../../utils/child-process.js';

import {Log} from '../../utils/logging.js';
import {Spinner} from '../../utils/spinner.js';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client.js';
import {addGithubTokenOption} from '../../utils/git/github-yargs.js';
import {getYarnPathFromNpmGlobalBinaries} from '../../utils/resolve-yarn-bin.js';

async function builder(argv: Argv) {
  return addGithubTokenOption(argv);
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
  /**
   * Process command that refers to the global Yarn installation.
   *
   * Note that we intend to use the global Yarn command here as this allows us to let Yarn
   * respect the `.yarnrc` file, allowing us to check if the update has completed properly.
   * Just using `yarn` does not necessarily resolve to the global Yarn version as Yarn-initiated
   * sub-processes will have a modified `process.env.PATH` that directly points to the Yarn
   * version that spawned the sub-process.
   */
  const yarnGlobalBin = (await getYarnPathFromNpmGlobalBinaries()) ?? 'yarn';
  /** Instance of the local git client. */
  const git = AuthenticatedGitClient.get();
  /** The main branch name of the repository. */
  const mainBranchName = git.mainBranchName;
  /** The original branch or ref before the command was invoked. */
  const originalBranchOrRef = git.getCurrentBranchOrRevision();

  if (git.hasUncommittedChanges()) {
    Log.error('Found changes in the local repository. Make sure there are no uncommitted files.');
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
    ChildProcess.spawnSync(yarnGlobalBin, ['policies', 'set-version', 'latest']);

    spinner.update('Confirming the version of yarn was updated.');

    const newYarnVersion = ChildProcess.spawnSync(yarnGlobalBin, ['-v'], {
      env: useYarnPathEnv,
    }).stdout.trim();

    if (git.run(['status', '--porcelain']).stdout.length === 0) {
      spinner.complete();
      Log.error('Yarn already up to date');
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
    Log.info(`Created PR #${number} to update to yarn v${newYarnVersion}`);
  } catch (e) {
    spinner.complete();
    Log.error('Aborted yarn update do to errors:');
    Log.error(e);
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
