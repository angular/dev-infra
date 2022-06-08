import {rebasePr} from '../../../../ng-dev/pr/rebase/index.js';
import {Octokit} from '@octokit/rest';
import {context} from '@actions/github';
import {getAuthTokenFor, ANGULAR_ROBOT} from '../../../utils.js';
import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {setConfig} from '../../../../ng-dev/utils/config.js';

export async function rebase() {
  const token = await getAuthTokenFor(ANGULAR_ROBOT);
  setConfig({
    github: {
      name: context.repo.repo,
      owner: context.repo.owner,
      mainBranchName: context.payload.repository!.default_branch,
    },
  });

  AuthenticatedGitClient.configure(token);

  if ((await rebasePr(context.issue.number, token)) !== 0) {
    // For any failure to rebase, comment on the PR informing the user a rebase was unable to be
    // be completed.

    const github = new Octokit({auth: token});
    await github.issues.createComment({
      ...context.repo,
      issue_number: context.issue.number,
      body:
        `@${context.actor} We were unable to perform a clean rebase of the PR, please reach out ` +
        'the PR author and ask them to perform the rebase.',
    });
  }
}
