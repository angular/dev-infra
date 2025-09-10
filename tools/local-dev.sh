#!/usr/bin/env bash
# Script that builds the `ng-dev` command and writes it as a standalone
# binary that can run outside of Bazel. This binary is then invoked
# with all arguments passed through. This is useful for local development.

set -e

devInfraProjectDir="$(dirname ${0})/.."
ngDevBinFile="${devInfraProjectDir}/dist/bin/ng-dev/npm_package/bundles/cli.mjs"
bazelCommand=${BAZEL:-"pnpm bazel"}

# Build the `ng-dev` binary into the `dev-infra/dist` directory.
# We need to build in a subshell as Bazel requires the working
# directory to be in the workspace folder to allow for building.
(
  cd ${devInfraProjectDir}
  ${bazelCommand} build ng-dev:npm_package
)

# Execute the built ng-dev command in the current working directory
# and pass-through arguments unmodified.
${ngDevBinFile} ${@}
