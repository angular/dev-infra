import {CommitMessageConfig} from '../ng-dev/commit-message/config';

/** Build a set of scopes for a package. */
function buildScopesFor(pkg: string, subpkgs: string[]) {
  return [pkg, ...subpkgs.map((subpkg: string) => `${pkg}/${subpkg}`)];
}

export const commitMessage: CommitMessageConfig = {
  maxLineLength: Infinity,
  minBodyLength: 0,
  scopes: [
    ...buildScopesFor('bazel', [
      'api-golden',
      'benchmark',
      'browsers',
      'protos',
      'remote-execution',
    ]),
    ...buildScopesFor('github-actions', [
      'breaking-changes-label',
      'feature-request',
      'lock-closed',
      'rebase',
      'rerun-circleci',
    ]),
    ...buildScopesFor('ng-dev', [
      'ci',
      'caretaker',
      'commit-message',
      'format',
      'ng-bot',
      'pr',
      'pullapprove',
      'release',
      'ts-circular-dependencies',
    ]),
  ],
};
