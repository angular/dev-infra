import {context} from '@actions/github';
import {Octokit} from '@octokit/rest';

export interface CodeReview {
  body: string;
  comments: {
    path: string;
    line: number;
    body: string;
  }[];
}

/**
 * Gets the raw diff of the pull request.
 */
export async function getPullRequestDiff(octokit: Octokit): Promise<string> {
  const response = await octokit.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
    mediaType: {
      format: 'diff',
    },
  });

  // When requesting 'diff' format, the data is returned as a string.
  return response.data as unknown as string;
}

/**
 * Gets the full contents of all files that were modified in the pull request.
 */
export async function getModifiedFilesContext(octokit: Octokit, ref: string) {
  // Get list of files changed in the PR
  const filesResponse = await octokit.rest.pulls.listFiles({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
    per_page: 100, // Handle up to 100 files, could add pagination if needed
  });

  const modifiedFiles = filesResponse.data.filter(
    (f) => f.status === 'added' || f.status === 'modified',
  );

  const fileContents = await Promise.all(
    modifiedFiles.map(async (file) => {
      try {
        const contentResponse = await octokit.rest.repos.getContent({
          owner: context.repo.owner,
          repo: context.repo.repo,
          path: file.filename,
          ref,
        });

        // The content is base64 encoded by GitHub
        if (
          'type' in contentResponse.data &&
          contentResponse.data.type === 'file' &&
          'content' in contentResponse.data
        ) {
          const content = Buffer.from(contentResponse.data.content, 'base64').toString('utf8');
          return {filename: file.filename, content, status: file.status};
        }
        return null;
      } catch (e) {
        // e.g. file is too large or not available
        return null;
      }
    }),
  );

  return fileContents.filter((f) => f !== null);
}

/**
 * Gets the text of any failed check runs for the commit, which may contain lint errors or test failures.
 */
export async function getFailedChecks(
  octokit: Octokit,
  ref: string,
): Promise<{name: string; output: string | null}[]> {
  // Keep the query broad because our action runs, so some checks might still be 'in_progress' or 'queued'. We want 'completed' -> 'failure'
  const checksResponse = await octokit.rest.checks.listForRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref,
    status: 'completed',
    per_page: 100,
  });

  const failedRuns = checksResponse.data.check_runs.filter(
    (run) =>
      run.conclusion === 'failure' ||
      run.conclusion === 'timed_out' ||
      run.conclusion === 'action_required',
  );

  return failedRuns.map((run) => {
    let outputText = '';
    if (run.output) {
      if (run.output.title) outputText += `${run.output.title}\n`;
      if (run.output.summary) outputText += `${run.output.summary}\n`;
      if (run.output.text) outputText += `\n${run.output.text}`;
    }
    return {
      name: run.name,
      output: outputText.trim() === '' ? null : outputText.trim(),
    };
  });
}

/**
 * Posts the review comment to the pull request.
 */
export async function postReviewComment(
  octokit: Octokit,
  {body, comments}: CodeReview,
): Promise<void> {
  await octokit.rest.pulls.createReview({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
    body,
    comments,
    event: 'COMMENT',
  });
}
