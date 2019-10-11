#!/bin/bash
set -e

# Set email and name config
git config --global user.email "devops+rebase@angular.io"
git config --global user.name "Angular Rebase Bot"

# Exit code for a successful run
SUCCESS_EXIT_CODE=0

# Information taken from github event object
TARGET_REPOSITORY=$(jq -r ".pull_request.base.repo.full_name" "$GITHUB_EVENT_PATH")
TARGET_BRANCH=$(jq -r ".pull_request.base.ref" "$GITHUB_EVENT_PATH")
PR_NUMBER=$(jq -r ".pull_request.number" "$GITHUB_EVENT_PATH")

# Change to the github workspace and initialize the repo if needed.
cd "$GITHUB_WORKSPACE"
git init


curl -L -s https://github.com/$TARGET_REPOSITORY/pull/$PR_NUMBER.diff > /tmp/pull.diff;


# Add pr and target repos as remotes, then fetch the remote branches
git remote add target https://github.com/$TARGET_REPOSITORY
git fetch target "$TARGET_BRANCH"

git branch -v

# Checkout the PR change branch from its remote, `--track` is used to ensure
# that the PRs remote branch is the branch that is pushed to later.
git checkout --track target/"$TARGET_BRANCH"

# Check if the patch file can be applied
git apply --check /tmp/presubmit_service/pull.diff 2>&1;
if [ $? -eq 0 ]; then
  echo "couldn't patch"
  exit 1
fi

exit $SUCCESS_EXIT_CODE