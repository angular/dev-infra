export const release = {
  representativeNpmPackage: '@angular/ng-dev',
  npmPackages: [
    {
      name: '@angular/ng-dev',
      snapshotRepo: 'dev-infra-private-ng-dev-builds',
    },
    {
      name: 'rules_angular',
      snapshotRepo: 'rules_angular',
    },
    {
      name: 'rules_browsers',
      snapshotRepo: 'rules_browsers',
    },
    {
      name: 'rules_sass',
      snapshotRepo: 'rules_sass',
    },
  ],
  buildPackages: async () => {
    // TODO: Create a standard build script instead of expecting the build to already be complete
    return [
      {
        name: '@angular/ng-dev',
        outputPath: './dist/bin/ng-dev/npm_package',
      },
      {
        name: 'rules_angular',
        outputPath: './dist/rules/rules_angular',
      },
      {
        name: 'rules_browsers',
        outputPath: './dist/rules/rules_browsers',
      },
      {
        name: 'rules_sass',
        outputPath: './dist/rules/rules_sass',
      },
    ];
  },
};
