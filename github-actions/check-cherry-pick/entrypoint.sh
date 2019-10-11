#!/bin/bash
set -e

# The full name of the repository
REPO_NAME=$(jq -r ".repository.full_name" "$GITHUB_EVENT_PATH")
# The PR number being checked
PR_NUMBER=$(jq -r ".pull_request.number" "$GITHUB_EVENT_PATH")
# The patch branch for the repository, using the provided TARGET environment variable if defined
if [[ -z $TARGET ]]; then
  TARGET_BRANCH=$(git ls-remote --heads https://github.com/$REPO_NAME.git | grep -E 'refs\/heads\/[0-9]+\.[0-9]+\.x' | cut -d '/' -f3 | sort -r | head -n1)
else
  TARGET_BRANCH=$TARGET
fi

echo $TARGET_BRANCH;

# Retrieve the patch file for the pr
curl -L -s https://github.com/$REPO_NAME/pull/$PR_NUMBER.diff > /tmp/pull.diff;

# Add target repo as remote, then fetch the target branch from the remote
git remote add target https://github.com/$REPO_NAME
git fetch target $TARGET_BRANCH

# Checkout the target branch from its remote
git checkout --track target/$TARGET_BRANCH

# Check if the patch file can be applied to the target branch cleanly and exit appropriately
git apply --check /tmp/pull.diff
if [ $? -ne 0 ]; then
  echo "git apply --check failed, exiting as a failure"
  exit 1
else
  echo "git apply --check was sucessful, exiting as a success"
  exit 0
fi
