import * as core from '@actions/core';
import {context} from '@actions/github';
import {createHash} from 'crypto';
import {existsSync, readFileSync} from 'fs';
import {GithubConfig, setConfig} from '../../../ng-dev/utils/config.js';
import {AuthenticatedGitClient} from '../../../ng-dev/utils/git/authenticated-git-client.js';
import {ANGULAR_ROBOT, getAuthTokenFor, revokeActiveInstallationToken} from '../../utils.js';

const enum ActionResult {
  created = 'created',
  failed = 'failed',
  nothing = 'nothing',
}

main();

// Helpers
async function main(): Promise<void> {
  let authToken: string | null = null;

  try {
    // Initialize outputs.
    core.setOutput('result', ActionResult.nothing);
    core.setOutput('pr-number', '');

    // Set the cached configuration object to be used throughout the action.
    const config: {github: GithubConfig} = {
      github: {
        mainBranchName: 'main',
        name: context.repo.repo,
        owner: context.repo.owner,
      },
    };
    setConfig(config);

    // Configure the `AuthenticatedGitClient` to be authenticated with the token for the Angular
    // Robot.
    authToken = await getAuthTokenFor(ANGULAR_ROBOT);
    AuthenticatedGitClient.configure(authToken);
    /** The authenticated GitClient. */
    const git = await AuthenticatedGitClient.get();
    git.run(['config', 'user.email', 'angular-robot@google.com']);
    git.run(['config', 'user.name', 'Angular Robot']);

    core.info('Initialized git/GitHub client.');

    // Determine which files have been modified.
    const touchedFiles = git
      .run(['status', '--porcelain'])
      .stdout.trim()
      .split('\n')
      .filter((l) => l !== '')
      .map((l) => l.replace(/^\S+\s+/, ''));

    // Check whether there are any changes to commit.
    if (touchedFiles.length === 0) {
      // There are no changes to commit/push. Exit.
      core.info('Skipping PR creation, because there are no changes.');
      return;
    } else {
      core.info(`Found ${touchedFiles.length} affected file(s).`);
    }

    // Create a branch name based on the provided branch-prefix and the contents of the changed
    // files.
    //
    // NOTE:
    //   Hashing the contents of the changed files is a heuristic to uniquely-ish represent a
    //   particular set of changes. It is not 100% accurate (and could result in both false
    //   positives and false negatives), but should be good enough for our purposes.
    const branchPrefix = core.getInput('branch-prefix', {required: true});
    const branchName = `${branchPrefix}-${hashFiles(touchedFiles)}`;

    // Check whether there is a PR for the same changes already.
    const {owner, repo} = context.repo;
    const base = context.ref.replace(/^refs\/heads\//, '');

    const {data: matchingPrs} = await git.github.pulls.list({
      owner,
      repo,
      base,
      head: `${owner}:${branchName}`,
      state: 'open',
    });

    if (matchingPrs.length > 0) {
      // A PR for the same set of changes does already exist. Exit.
      core.info(
        `Skipping PR creation, because there is already a PR: #${matchingPrs[0].number} ` +
          `(${matchingPrs[0].html_url})`,
      );
      return;
    } else {
      core.info(`No pre-existing PR found for branch '${branchName}'.`);
    }

    // Gather PRs (if any) that will be superseded by the PR that will be created.
    const {
      data: {items: supersededPrs},
    } = await git.github.search.issuesAndPullRequests({
      q: `is:pull-request is:open repo:${owner}/${repo} base:${base} head:${branchPrefix}-`,
      // NOTE:
      //   We assume that there will be no more than 100 open PRs for the same type of change. This
      //   is a reasonable assumption for our purposes, but even if it doesn't hold it won't be a
      //   big problem: It just means that older PRs will not be auto-closed and will not be marked
      //   as superseded.
      per_page: 100,
      sort: 'created',
      order: 'desc',
    });

    core.info(
      `Found ${supersededPrs.length} pre-existing PR(s) that will be superseded: ` +
        (supersededPrs.length === 0 ? '-' : supersededPrs.map((pr) => `#${pr.number}`).join(', ')),
    );

    // Commit the current changes on a new branch.
    const prTitle = core.getInput('pr-title', {required: true});
    const prDescription = core.getInput('pr-description', {required: true});
    const prFooter =
      supersededPrs.length === 0
        ? ''
        : `\n${supersededPrs.map((pr) => `\nCloses #${pr.number}`).join('')}`;
    const prBody = `${prDescription}${prFooter}`;
    const prLabels = core
      .getInput('pr-labels', {required: false})
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l !== '');
    const commitMessage = `${prTitle}\n\n${prBody}`;

    git.run(['checkout', '-b', branchName]);
    git.run(['add', '--all']);
    git.run(['commit', '-m', commitMessage, '--no-verify']);
    git.run(['push', '--force', git.getRepoGitUrl(), `HEAD:refs/heads/${branchName}`]);

    core.info('Committed changes.');

    // Create a PR and add the specified labels (if any).
    const {data: createdPr} = await git.github.pulls.create({
      owner,
      repo,
      base,
      head: branchName,
      title: prTitle,
      body: prBody,
      maintainer_can_modify: true,
    });

    core.setOutput('result', ActionResult.created);
    core.setOutput('pr-number', `${createdPr.number}`);

    core.info(`Created PR #${createdPr.number} (${createdPr.html_url}).`);

    if (prLabels.length > 0) {
      await git.github.issues.addLabels({
        owner,
        repo,
        issue_number: createdPr.number,
        labels: prLabels,
      });

      core.info(`Added ${prLabels.length} label(s) to PR: '${prLabels.join("', '")}'`);
    }

    // Comment on superseded PRs.
    if (supersededPrs.length > 0) {
      for (const pr of supersededPrs) {
        await git.github.issues.createComment({
          owner,
          repo,
          issue_number: pr.number,
          body: `Superseded by PR #${createdPr.number}.`,
        });

        // TODO(gkalpak):
        //   Do we want to add/remove labels on superseded PRs?
        //   For example, we could add `state: blocked` and remove `action: merge[-assistance]` by
        //   default (or we could make these configurable).
      }

      core.info('Commented on superseded PRs.');
    }
  } catch (err: any) {
    core.setOutput('result', ActionResult.failed);
    core.error(err);
    core.setFailed(err.message);
  } finally {
    if (authToken !== null) {
      await revokeActiveInstallationToken(authToken);
    }
  }
}

function hashFiles(filePaths: string[]): string {
  const hash = createHash('sha256');

  filePaths.forEach((path) => {
    hash.update(path, 'utf8');
    hash.update(existsSync(path) ? readFileSync(path) : Buffer.from('(deleted)'));
  });

  return hash.digest('hex');
}
