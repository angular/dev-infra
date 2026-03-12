/** Build a set of scopes for a package. */
function buildScopesFor(pkg, subpkgs) {
  return [pkg, ...subpkgs.map((subpkg) => `${pkg}/${subpkg}`)];
}

/**
 * The configuration for `ng-dev commit-message` commands.
 *
 * @type { import("../ng-dev/index.js").CommitMessageConfig }
 */
export const commitMessage = {
  maxLineLength: Infinity,
  minBodyLength: 0,
  scopes: [
    ...buildScopesFor('bazel', [
      'api-golden',
      'constraints',
      'http-server',
      'integration',
      'jasmine',
      'protos',
      'remote-execution',
      'spec-bundling',
      'git-toolchain',
      'rules_angular',
      'rules_browser',
      'rules_sass',
    ]),
    ...buildScopesFor('github-actions', [
      'pull-request-labeling',
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
    ...buildScopesFor('apps', []),
    ...buildScopesFor('lint-rules', ['tslint', 'stylelint']),
    ...buildScopesFor('renovate-presets', []),
  ],
};
