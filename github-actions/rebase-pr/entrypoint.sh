#!/bin/bash
set -e

# Set email and name config
git config --global user.email "devops+rebase@angular.io"
git config --global user.name "Angular Rebase Bot"

# Exit code for a successful run
SUCCESS_EXIT_CODE=0

# The repository name and branch name for the PRs head and base
PR_REPOSITORY=$(jq -r ".pull_request.head.repo.full_name" "$GITHUB_EVENT_PATH")
PR_BRANCH=$(jq -r ".pull_request.head.ref" "$GITHUB_EVENT_PATH")
TARGET_REPOSITORY=$(jq -r ".pull_request.base.repo.full_name" "$GITHUB_EVENT_PATH")
TARGET_BRANCH=$(jq -r ".pull_request.base.ref" "$GITHUB_EVENT_PATH")

# Change to the github workspace and initialize the repo if needed.
cd "$GITHUB_WORKSPACE"
git init

# Add pr and target repos as remotes, then fetch the remote branches
git remote add pr https://x-access-token:$TOKEN@github.com/$PR_REPOSITORY
git remote add target https://x-access-token:$TOKEN@github.com/$TARGET_REPOSITORY
git fetch pr "$PR_BRANCH"
git fetch target "$TARGET_BRANCH"

# Checkout the PR change branch from its remote, `--track` is used to ensure
# that the PRs remote branch is the branch that is pushed to later.
git checkout --track pr/"$PR_BRANCH"

# Perform rebase of PR
git rebase target/"$TARGET_BRANCH"

# TODO(josephperrott): Push a comment to the PR asking the author to rebase 
# if the automatic rebase fails.

# Push the rebased code back to the remote, using force as this is required
# for rebases, then exit with a success exit code. `--force-with-lease` is
# used to protect from the unlikely situation in which an update is pushed
# to the PR during the rebase action process.
git push --force-with-lease pr "$PR_BRANCH"
exit $SUCCESS_EXIT_CODE