#!/bin/bash

# Script to publish the build artifacts to a GitHub repository.
# Builds will be automatically published once new changes are made to the repository.

# Script arguments:
#  - $1: Package name
#  - $2: Package builds repository
#  - $3: Package dist directory (e.g. in bazel-out)

# The script should immediately exit if any command in the script fails.
set -e

# Go to the project root directory
cd $(dirname ${0})/..

if [ -z ${DEV_INFRA_BUILDS_TOKEN} ]; then
  echo "Error: No access token for GitHub could be found." \
       "Please set the environment variable 'DEV_INFRA_BUILDS_TOKEN'."
  exit 1
fi

packageName="${1}"
packageRepo="${2}"
packageDistDir="${3}"

buildVersion=$(cd ${packageDistDir} && node -pe "require('./package.json').version")
branchName=${CIRCLE_BRANCH:-'main'}
commitSha=$(git rev-parse --short HEAD)
commitAuthorName=$(git --no-pager show -s --format='%an' HEAD)
commitAuthorEmail=$(git --no-pager show -s --format='%ae' HEAD)
commitMessage=$(git log --oneline -n 1)

buildVersionName="${buildVersion}-sha-${commitSha}"
buildTagName="${branchName}-${commitSha}"
buildCommitMessage="${branchName} - ${commitMessage}"

repoUrl="https://github.com/angular/${packageRepo}.git"
authenticatedRepoUrl="https://${DEV_INFRA_BUILDS_TOKEN}:@github.com/angular/${packageRepo}.git"
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
cp -r ${packageDistDir}/* ./

# Prepare Git for pushing the artifacts to the repository.
git config user.name "${commitAuthorName}"
git config user.email "${commitAuthorEmail}"

echo "Git configuration has been updated to match the last commit author. Publishing now.."

git add -A

if git diff-index --quiet HEAD --; then
  echo "Skipping push as no changes occured between this push and the previous commit."
else
  git commit -m "${buildCommitMessage}"
  git push ${authenticatedRepoUrl} ${branchName} --force
  echo "Published package artifacts for ${packageName}#${buildVersionName} into ${branchName}"
fi
