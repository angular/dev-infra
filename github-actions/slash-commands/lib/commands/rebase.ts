import {rebasePr} from '../../../../ng-dev/pr/rebase/index.js';
import {Octokit} from '@octokit/rest';
import {context} from '@actions/github';
import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {setConfig} from '../../../../ng-dev/utils/config.js';

export async function rebase(installationClient: Octokit, installationToken: string) {
  setConfig({
    github: {
      name: context.repo.repo,
      owner: context.repo.owner,
      mainBranchName: context.payload.repository!.default_branch,
    },
  });

  AuthenticatedGitClient.configure(installationToken);

  if ((await rebasePr(context.issue.number, installationToken)) !== 0) {
    // For any failure to rebase, comment on the PR informing the user a rebase was unable to be
    // be completed.
    await installationClient.issues.createComment({
      ...context.repo,
      issue_number: context.issue.number,
      body:
        `@${context.actor} We were unable to perform a clean rebase of the PR, please reach out ` +
        'the PR author and ask them to perform the rebase.',
    });
  }
}
