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
      'markdown-to-html',
      'protos',
      'remote-execution',
      'spec-bundling',
    ]),
    ...buildScopesFor('github-actions', [
      'commit-message-based-labels',
      'feature-request',
      'lock-closed',
      'rebase',
    ]),
    ...buildScopesFor('ng-dev', [
      'caretaker',
      'commit-message',
      'format',
      'ng-bot',
      'pr',
      'pullapprove',
      'release',
      'ts-circular-dependencies',
    ]),
    ...buildScopesFor('api-gen', []),
    ...buildScopesFor('apps', []),
    ...buildScopesFor('circleci-orb', []),
    ...buildScopesFor('lint-rules', ['tslint', 'stylelint']),
    ...buildScopesFor('shared-scripts', []),
    ...buildScopesFor('shared-docs', []),
  ],
};
