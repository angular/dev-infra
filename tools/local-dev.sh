#!/usr/bin/env bash
# Script that builds the `ng-dev` command and writes it as a standalone
# binary that can run outside of Bazel. This binary is then invoked
# with all arguments passed through. This is useful for local development.

set -e

devInfraProjectDir="$(dirname ${0})/.."
ngDevBinFile="${devInfraProjectDir}/dist/bin/npm_package/ng-dev/bundles/cli.mjs"
bazelCommand=${BAZEL:-"yarn bazel"}

# Build the `ng-dev` binary into the `dev-infra/dist` directory.
# We need to build in a subshell as Bazel requires the working
# directory to be in the workspace folder to allow for building.
(
  cd ${devInfraProjectDir}
  ${bazelCommand} build :npm_package
)

export TS_NODE_TRANSPILE_ONLY=1
export TS_NODE_PROJECT=${PWD}/.ng-dev/tsconfig.json

# Execute the built ng-dev command in the current working directory
# and pass-through arguments unmodified.
node --no-warnings --loader ts-node/esm ${ngDevBinFile} ${@}
