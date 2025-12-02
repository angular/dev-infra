import {
  assertValidPullRequestConfig,
  PullRequestConfig,
} from '../../../../ng-dev/pr/config/index.js';

import {AuthenticatedGitClient} from '../../../../ng-dev/utils/git/authenticated-git-client.js';
import {
  assertValidCaretakerConfig,
  assertValidGithubConfig,
  CaretakerConfig,
  getConfig,
  GithubConfig,
  setConfig,
} from '../../../../ng-dev/utils/config.js';

/** The branch used as the primary branch for the temporary repo. */
const mainBranchName = 'main';

export async function setupConfigAndGitClient(token: string, repo: {owner: string; repo: string}) {
  // Manually define the configuration for the pull request and github to prevent having to
  // checkout the repository before defining the config.
  // TODO(josephperrott): Load this from the actual repository.
  setConfig(<{pullRequest: PullRequestConfig; github: GithubConfig; caretaker: CaretakerConfig}>{
    github: {
      mainBranchName,
      owner: repo.owner,
      name: repo.repo,
      mergeMode: 'caretaker-only',
    },
    pullRequest: {
      githubApiMerge: false,
    },
    caretaker: {},
  });
  /** The configuration used for the ng-dev tooling. */
  const config = await getConfig([
    assertValidGithubConfig,
    assertValidPullRequestConfig,
    assertValidCaretakerConfig,
  ]);

  AuthenticatedGitClient.configure(token);
  /** The git client used to perform actions. */
  const git = await AuthenticatedGitClient.get();

  // Needed for testing the merge-ability via `git cherry-pick` in the merge strategy.
  git.run(['config', 'user.email', 'angular-robot@google.com']);
  git.run(['config', 'user.name', 'Angular Robot']);

  return {
    config,
    git,
  };
}
