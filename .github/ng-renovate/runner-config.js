module.exports = {
  branchPrefix: 'ng-renovate/',
  gitAuthor: 'Angular Robot <angular-robot@google.com>',
  platform: 'github',
  branchNameStrict: true,
  // This is needed as otherwise Renovate will add `--ignore-pnpmfile`.
  // See: https://github.com/renovatebot/renovate/blob/93fa41b26fdef8584be4d0c2582fa12397ae4360/lib/modules/manager/npm/post-update/pnpm.ts#L111-L118
  allowScripts: true,
  // Renovate fork PRs should never be editable as Renovate would otherwise
  // not be able to delete the branches and future updates would be missed.
  forkModeDisallowMaintainerEdits: true,
  onboarding: false,
  persistRepoData: true,
  allowedCommands: ['.'],
  hostRules: [
    {
      matchHost: 'api.github.com',
      concurrentRequestLimit: 4,
    },
  ],
  productLinks: {
    documentation: 'https://docs.renovatebot.com/',
    help: 'https://github.com/angular/dev-infra',
    homepage: 'https://github.com/angular/dev-infra',
  },
};
