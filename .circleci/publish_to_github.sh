#!/bin/bash

# TODO(josephperrott): Remove this script in favor of common orb to perform the task.

# Script to publish the build artifacts to a GitHub repository.
# Builds will be automatically published once new changes are made to the repository.

# The script should immediately exit if any command in the script fails.
set -e

# Go to the project root directory
cd $(dirname ${0})/..

if [ -z ${DEV_INFRA_BUILDS_TOKEN} ]; then
  echo "Error: No access token for GitHub could be found." \
       "Please set the environment variable 'DEV_INFRA_BUILDS_TOKEN'."
  exit 1
fi

# Function to publish artifacts of a package to Github.
publishPackage() {
  packageName="dev-infra-private"
  packageRepo="dev-infra-private-builds"
  buildDir="$(pwd)/dist/bin/npm_package"
  buildVersion=$(node -pe "require('./package.json').version")
  branchName=${CIRCLE_BRANCH:-'master'}
  commitSha=$(git rev-parse --short HEAD)
  commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
  commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
  commitMessage=$(git log --oneline -n 1)

  buildVersionName="${buildVersion}-sha-${commitSha}"
  buildTagName="${branchName}-${commitSha}"
  buildCommitMessage="${branchName} - ${commitMessage}"

  repoUrl="https://github.com/angular/${packageRepo}.git"
  repoDir="/tmp/${packageRepo}"

  echo "Starting publish process of ${packageName} for ${buildVersionName} into ${branchName}.."

  # Prepare cloning the builds repository
  rm -rf ${repoDir}
  mkdir -p ${repoDir}

  echo "Starting cloning process of ${repoUrl} into ${repoDir}.."

  if [[ $(git ls-remote --heads ${repoUrl} ${branchName}) ]]; then
    echo "Branch ${branchName} already exists. Cloning that branch."
    git clone ${repoUrl} ${repoDir} --depth 1 --branch ${branchName}
    cd ${repoDir}

    echo "Cloned repository and switched into the repository directory (${repoDir})."
  else
    echo "Branch ${branchName} does not exist on ${packageRepo} yet."
    echo "Cloning default branch and creating branch '${branchName}' on top of it."

    git clone ${repoUrl} ${repoDir} --depth 1
    cd ${repoDir}
    echo "Cloned repository and switched into directory. Creating new branch now.."

    git checkout -b ${branchName}
  fi

  # Copy the build files to the repository
  rm -rf ./*
  cp -r ${buildDir}/* ./

  # Prepare Git for pushing the artifacts to the repository.
  git config user.name "${commitAuthorName}"
  git config user.email "${commitAuthorEmail}"
  git config credential.helper "store --file=.git/credentials"

  echo "https://${DEV_INFRA_BUILDS_TOKEN}:@github.com" > .git/credentials

  echo "Git configuration has been updated to match the last commit author. Publishing now.."

  git add -A

  if git diff-index --quiet HEAD --; then
    echo "Skipping push as no changes occured between this push and the previous commit."
  else
    git commit -m "${buildCommitMessage}"
    git push origin ${branchName} --force
    echo "Published package artifacts for ${packageName}#${buildVersionName} into ${branchName}"
  fi
}

# Run the publish package function
publishPackage
