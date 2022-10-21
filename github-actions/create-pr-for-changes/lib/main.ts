import * as core from '@actions/core';
import {context} from '@actions/github';
import {createHash} from 'crypto';
import {existsSync, readFileSync} from 'fs';
import {GithubConfig, setConfig} from '../../../ng-dev/utils/config.js';
import {AuthenticatedGitClient} from '../../../ng-dev/utils/git/authenticated-git-client.js';
import {GithubRepo} from '../../../ng-dev/utils/git/github.js';
import {getRepositoryGitUrl} from '../../../ng-dev/utils/git/github-urls.js';

const enum ActionResult {
  created = 'created',
  failed = 'failed',
  nothing = 'nothing',
}

main();

// Helpers
async function main(): Promise<void> {
  try {
    // Initialize outputs.
    core.setOutput('result', ActionResult.nothing);
    core.setOutput('pr-number', '');

    // Set the cached configuration object to be used throughout the action.
    const repo: GithubRepo = {owner: context.repo.owner, name: context.repo.repo};
    const config: {github: GithubConfig} = {
      github: {
        ...repo,
        mainBranchName: 'main',
      },
    };
    setConfig(config);

    // Configure the `AuthenticatedGitClient` to be authenticated with the provided GitHub access
    // token for Angular Robot.
    const accessToken = core.getInput('angular-robot-token', {required: true});
    AuthenticatedGitClient.configure(accessToken);
    /** The authenticated GitClient. */
    const git = await AuthenticatedGitClient.get();
    git.run(['config', 'user.email', 'angular-robot@google.com']);
    git.run(['config', 'user.name', 'Angular Robot']);

    core.info('Initialized git/GitHub client.');

    // Unless configured otherwise, clean up obsolete branches.
    const branchPrefix = `${core.getInput('branch-prefix', {required: true})}-`;
    const cleanUpBranches = core.getInput('clean-up-branches', {required: true}) === 'true';
    const forkRepo = await git.getForkOfAuthenticatedUser();

    if (cleanUpBranches) {
      await cleanUpObsoleteBranches(git, repo, forkRepo, branchPrefix);
    }

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

    // Create a branch name based on the provided branch-prefix, the target branch and the contents
    // of the changed files.
    //
    // NOTE:
    //   Hashing the contents of the changed files is a heuristic to uniquely-ish represent a
    //   particular set of changes. It is not 100% accurate (and could result in both false
    //   positives and false negatives), but should be good enough for our purposes.
    const baseBranch = core.getInput('base-branch', {required: true});
    const branchName = `${branchPrefix}${repo.owner}-${repo.name}-${baseBranch}-${hashFiles(
      touchedFiles,
    )}`;

    // Check whether there is a PR for the same changes already.
    const {data: matchingPrs} = await git.github.pulls.list({
      owner: repo.owner,
      repo: repo.name,
      base: baseBranch,
      head: `${forkRepo.owner}:${branchName}`,
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
      q: toGithubSearchQuery({
        repo: `${repo.owner}/${repo.name}`,
        type: 'pull-request',
        author: forkRepo.owner,
        base: baseBranch,
        head: branchPrefix,
        state: 'open',
      }),
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
    git.run([
      'push',
      getRepositoryGitUrl(forkRepo, git.githubToken),
      `HEAD:refs/heads/${branchName}`,
    ]);

    core.info('Committed changes and pushed to GitHub.');

    // Create a PR and add the specified labels (if any).
    const {data: createdPr} = await git.github.pulls.create({
      owner: repo.owner,
      repo: repo.name,
      base: baseBranch,
      head: `${forkRepo.owner}:${branchName}`,
      title: prTitle,
      body: prBody,
      maintainer_can_modify: true,
    });

    core.setOutput('result', ActionResult.created);
    core.setOutput('pr-number', `${createdPr.number}`);

    core.info(`Created PR #${createdPr.number} (${createdPr.html_url}).`);

    if (prLabels.length > 0) {
      await git.github.issues.addLabels({
        owner: repo.owner,
        repo: repo.name,
        issue_number: createdPr.number,
        labels: prLabels,
      });

      core.info(`Added ${prLabels.length} label(s) to PR: '${prLabels.join("', '")}'`);
    }

    // Comment on superseded PRs.
    if (supersededPrs.length > 0) {
      for (const pr of supersededPrs) {
        await git.github.issues.createComment({
          owner: repo.owner,
          repo: repo.name,
          issue_number: pr.number,
          body: `Superseded by PR #${createdPr.number}.`,
        });

        // TODO(gkalpak):
        //   Do we want to add/remove labels on superseded PRs?
        //   For example, we could add `state: blocked` and remove `action: merge[-assistance]` by
        //   default (or we could make these configurable).
      }

      core.info(`Commented on ${supersededPrs.length} superseded PRs.`);
    }
  } catch (err: any) {
    core.setOutput('result', ActionResult.failed);
    console.error(err);
    core.setFailed(err.message);
  }
}

/**
 * Clean up obsolete branches.
 *
 * Check for associated branches (identified by the branch name prefix) that correspond to closed
 * PRs.
 *
 * Implementation notes:
 *   1. Retrieve the 10 most recent, closed PRs created by the currently authenticated account that
 *      match the specified branch name prefix.
 *   2. For each PR, retrieve the associated branch name.
 *   3. Delete the retrieved branches.
 *
 *   NOTE 1:
 *     Since there is no way to efficiently retrieve the obsolete branches, we have to make a
 *     separate request for each obsolete PR. Therefore, we limit the number of obsolete PRs we look
 *     for to 10 (which will result in up to 10 additional requests for the corresponding branch
 *     names).
 *
 *   NOTE 2:
 *     Since we limit the number of PRs to retrieve, it is possible that older branches will not be
 *     deleted (even if obsolete). This is not a big problem: It just means that they will not be
 *     automatically deleted.
 *
 *   NOTE 3:
 *     Some of the retrieved obsolete branches might be already deleted. This will result in logging
 *     a warning, but the command will still complete successfully.
 *
 * @param git An `AuthenticatedGitClient` instance.
 * @param repo The info of the repository PRs are opened in.
 * @param forkRepo The info of the repository PRs are opened from (typically a fork of `repo`).
 * @param branchPrefix The branch name prefix used in PRs opened by this action.
 */
async function cleanUpObsoleteBranches(
  git: AuthenticatedGitClient,
  repo: GithubRepo,
  forkRepo: GithubRepo,
  branchPrefix: string,
): Promise<void> {
  // Gather closed PRs (if any) that where created by this action (identified based on their branch
  // name prefix).
  const {
    data: {items: obsoletePrs},
  } = await git.github.search.issuesAndPullRequests({
    q: toGithubSearchQuery({
      repo: `${repo.owner}/${repo.name}`,
      type: 'pull-request',
      author: forkRepo.owner,
      head: branchPrefix,
      state: 'closed',
    }),
    // NOTE:
    //   We assume that there will be no more than 10 closed PRs for the same type of change.
    //   Typically, there will be at most 1 closed PR per branch that the action runs on, so this is
    //   a reasonable assumption for our purposes. But even if it doesn't hold it won't be a big
    //   problem: It just means that older branches will not be automatically deleted.
    per_page: 10,
    sort: 'created',
    order: 'desc',
  });

  core.info(
    `Found ${obsoletePrs.length} closed PR(s) that match the specified branch name prefix: ` +
      (obsoletePrs.length === 0 ? '-' : obsoletePrs.map((pr) => `#${pr.number}`).join(', ')),
  );

  // Get the branch name associated with each of the obsolete PRs.
  const obsoleteBranches = await Promise.all(
    obsoletePrs.map((pr) => getBranchNameForPr(git, repo, pr.number)),
  );

  core.info(
    `Found ${obsoleteBranches.length} obsolete branches that will be deleted: ` +
      (obsoleteBranches.length === 0 ? '-' : obsoleteBranches.join(', ')),
  );

  // Delete the obsolete branches.
  for (const branchName of obsoleteBranches) {
    git.run(['push', getRepositoryGitUrl(forkRepo, git.githubToken), `:refs/heads/${branchName}`]);
  }

  core.info(`Deleted ${obsoleteBranches.length} obsolete branches.`);
}

/**
 * Get the source (head) branch name of a PR.
 *
 * @param git An `AuthenticatedGitClient` instance.
 * @param repo The info of the repository to search in.
 * @param prNumber The number of the PR whose source branch name is to be retrieved.
 * @returns The name of the source branch.
 */
async function getBranchNameForPr(
  git: AuthenticatedGitClient,
  repo: GithubRepo,
  prNumber: number,
): Promise<string> {
  const {data: pr} = await git.github.pulls.get({
    owner: repo.owner,
    repo: repo.name,
    pull_number: prNumber,
  });
  return pr.head.ref;
}

/**
 * Compute the combined hash of the contents of a set of files.
 *
 * NOTE:
 *   Deleted files are represented with the string `(deleted)`.
 *
 * @param filePaths The paths of the files to combine.
 * @returns The hash in hexadecimal encoding.
 */
function hashFiles(filePaths: string[]): string {
  const hash = createHash('sha256');

  filePaths.forEach((path) => {
    hash.update(path, 'utf8');
    hash.update(existsSync(path) ? readFileSync(path) : Buffer.from('(deleted)'));
  });

  return hash.digest('hex');
}

/**
 * Convert an object to a GitHub search query string.
 *
 * See also
 * https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests.
 *
 * @param params The object to convert.
 * @returns A GitHub search query as string.
 */
function toGithubSearchQuery(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, val]) => `${key}:${val}`)
    .join(' ');
}
