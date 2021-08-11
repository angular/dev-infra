/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ora from 'ora';
import {unlinkSync} from 'fs';
import {join} from 'path';
import {Argv, CommandModule} from 'yargs';
import {spawnSync} from '../../utils/child-process';

import {error, info, red} from '../../utils/console';
import {AuthenticatedGitClient} from '../../utils/git/authenticated-git-client';
import {addGithubTokenOption} from '../../utils/git/github-yargs';

async function builder(yargs: Argv) {
  return addGithubTokenOption(yargs);
}

/** Handles the command. */
async function handler() {
  /** Instance of the local git client. */
  const git = AuthenticatedGitClient.get();
  /** The main branch name of the repository. */
  const mainBranchName = git.mainBranchName;

  /** The original branch or ref before the command was invoked. */
  const originaBranchOrRef = git.getCurrentBranchOrRevision();
  if (git.hasUncommittedChanges()) {
    error(
      red(`Local working repository not clean. Please make sure there are no uncommitted changes.`),
    );
    process.exitCode = 1;
    return;
  }

  /** Version numbers of the current (old) and new yarn installs. */
  const yarnVersion = {
    old: spawnSync('yarn', ['-v']).stdout.trim(),
    new: spawnSync('yarn', ['info', 'yarn@latest', 'dist-tags.latest']).stdout.trim(),
  };

  if (yarnVersion.old === yarnVersion.new) {
    info(`Yarn already updated to latest yarn (${yarnVersion.old})`);
    process.exitCode = 1;
    return;
  }

  /* File path of old yarn version */
  const oldYarnPath = join(git.baseDir, `.yarn/releases/yarn-${yarnVersion.old}.cjs`);
  const title = `build: update to yarn v${yarnVersion.new}`;
  const body = `Update to the latest version of yarn, ${yarnVersion.new}.`;
  const commitMessage = `${title}\n\n${body}`;
  const {owner, repo} = git.remoteParams;
  const branchName = `yarn-update-v${yarnVersion.new}`;
  const localOwner = (await git.getForkOfAuthenticatedUser()).owner;
  const spinner = ora().start();
  try {
    git.run(['fetch', '-q', git.getRepoGitUrl(), mainBranchName]);
    git.checkout('FETCH_HEAD', false);

    spinner.text = `Updating from yarn version '${yarnVersion.old}' to '${yarnVersion.new}'`;
    spinner.render();
    spawnSync('yarn', ['policies', 'set-version', 'latest']);

    spinner.text = `Removing previous yarn version (${yarnVersion.old})`;
    spinner.render();
    unlinkSync(oldYarnPath);

    spinner.text = 'Staging yarn vendoring files and creating commit';
    spinner.render();
    git.run(['add', '.yarn/releases/**', '.yarnrc']);

    /**
     * New environment object with identifiers removed which prevent yarn from correctly loading
     * new version from within a yarn call.
     */
    const env = {
      ...process.env,
      YARN_IGNORE_PATH: '0',
      'PATH': process.env['PATH']!.replace(/\/tmp\/yarn.+?\:/, ''),
    };

    git.run(['commit', '-q', '--no-verify', '-m', commitMessage], {env});

    spinner.text = 'Pushing commit changes to github.';
    git.run(['push', '-q', 'origin', '--force-with-lease', `HEAD:refs/heads/${branchName}`]);

    const {number} = (
      await git.github.pulls.create({
        owner,
        repo,
        title,
        body,
        base: mainBranchName,
        head: `${localOwner}:${branchName}`,
      })
    ).data;

    spinner.succeed(`Created PR #${number} to update to yarn v${yarnVersion.new}`);
  } catch (e) {
    spinner.fail('Aborted yarn update do to errors:');
    error(e);
    process.exitCode = 1;
  } finally {
    git.checkout(originaBranchOrRef, true);
  }
}

/** CLI command module. */
export const UpdateYarnCommandModule: CommandModule = {
  builder,
  handler,
  command: 'update-yarn',
  describe: false,
};
