module.exports = {
  branchPrefix: 'ng-renovate/',
  gitAuthor: 'Angular Robot Bot <angular-robot@google.com>',
  repositories: ['angular/dev-infra', 'angular/components'],
  onboarding: false,
  forkMode: true,
  forkToken: process.env.NG_RENOVATE_USER_TOKEN,
  platform: 'github',
};
