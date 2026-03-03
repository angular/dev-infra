export const release = {
  representativeNpmPackage: '@angular/ng-dev',
  npmPackages: [
    {
      name: '@angular/ng-dev',
      snapshotRepo: 'dev-infra-private-ng-dev-builds',
    },
  ],
  buildPackages: async () => {
    // TODO: Create a standard build script instead of expecting the build to alreqady be complete
    return [
      {
        name: '@angular/ng-dev',
        outputPath: './dist/bin/ng-dev/npm_package',
      },
    ];
  },
};
