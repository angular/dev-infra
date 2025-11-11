/**
 * Github configuration for the `ng-dev` command. This repository is used as
 * remote for the merge script and other utilities like `ng-dev pr rebase`.
 *
 * @type { import("../ng-dev/index.js").GithubConfig }
 */
export const github = {
  owner: 'angular',
  name: 'dev-infra',
  mainBranchName: 'main',
  useNgDevAuthService: true,
};
