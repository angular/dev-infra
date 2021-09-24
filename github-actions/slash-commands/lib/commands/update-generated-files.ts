import {context} from '@actions/github';
import {setFailed} from '@actions/core';
import {getAuthTokenFor, ANGULAR_ROBOT} from '../../../utils';
import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client';
import {setConfig} from '../../../../ng-dev/utils/config';
import {checkOutPullRequestLocally} from '../../../../ng-dev/pr/common/checkout-pr';
import {updateAllGeneratedFileTargets} from '../../../../ng-dev/misc/update-generated-files';

export async function updateGeneratedFiles() {
  const token = await getAuthTokenFor(ANGULAR_ROBOT);
  setConfig({
    github: {
      name: context.repo.repo,
      owner: context.repo.owner,
      mainBranchName: context.payload.repository!.default_branch,
    },
  });

  AuthenticatedGitClient.configure(token);
  const git = AuthenticatedGitClient.get();

  const {pushToUpstream} = await checkOutPullRequestLocally(context.issue.number, git.githubToken);

  const {succeeded} = updateAllGeneratedFileTargets();

  if (succeeded) {
    git.run(['add', '-A']);
    git.run(['commit', '--no-verify', '--fixup', 'HEAD']);
    pushToUpstream();
    return;
  }

  setFailed('Unable to update all generated files, check the logs above for more detail');
}
