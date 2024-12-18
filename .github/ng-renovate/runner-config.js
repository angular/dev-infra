module.exports = {
  branchPrefix: 'ng-renovate/',
  gitAuthor: 'Angular Robot <angular-robot@google.com>',
  platform: 'github',
  branchNameStrict: true,
  // Renovate fork PRs should never be editable as Renovate would otherwise
  // not be able to delete the branches and future updates would be missed.
  forkModeDisallowMaintainerEdits: true,
  onboarding: false,
  persistRepoData: true,
  allowedPostUpgradeCommands: ['.', '^yarn install$', '^yarn update-generated-files$'],
  hostRules: [
    {
      matchHost: 'api.github.com',
      concurrentRequestLimit: 1,
    },
  ],
  productLinks: {
    documentation: 'https://docs.renovatebot.com/',
    help: 'https://github.com/angular/dev-infra',
    homepage: 'https://github.com/angular/dev-infra',
  },
};
