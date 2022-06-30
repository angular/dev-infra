import {CommitMessageConfig} from '../ng-dev/commit-message/config.js';

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
      'app-bundling',
      'benchmark',
      'browsers',
      'constraints',
      'esbuild',
      'http-server',
      'integration',
      'karma',
      'map-size-tracking',
      'protos',
      'remote-execution',
      'spec-bundling',
    ]),
    ...buildScopesFor('github-actions', [
      'commit-message-based-labels',
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
    ...buildScopesFor('apps', []),
    ...buildScopesFor('tslint-rules', []),
    ...buildScopesFor('shared-scripts', []),
    ...buildScopesFor('circleci-orb', []),
  ],
};
