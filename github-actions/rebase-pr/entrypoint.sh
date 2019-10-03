#! /bin/bash

set -e


# Is the event a label being added
if [[ "$(jq -r ".action" "$GITHUB_EVENT_PATH")" != "labeled" ]]; then
	echo "Exiting, this is not a labeled event"
	exit $NEUTRAL_EXIT_CODE
fi

if [[ ! $(jq ".pull_request.labels" "$GITHUB_EVENT_PATH" | jq ".[].name" | grep "rebase PR") ]]; then
	echo "Exiting, the Pull Request does not contain the rebase label"
	exit $NEUTRAL_EXIT_CODE
fi

if [[ "$(echo "$GITHUB_EVENT_PATH" | jq -r .rebaseable)" == "false" ]]; then
	echo "GitHub has marked the Pull Request as non-rebaseable!"
	exit 1
fi

BASE_REPO=$(echo "$GITHUB_EVENT_PATH" | jq -r .base.repo.full_name)
BASE_BRANCH=$(echo "$GITHUB_EVENT_PATH" | jq -r .base.ref)

HEAD_REPO=$(echo "$GITHUB_EVENT_PATH" | jq -r .head.repo.full_name)
HEAD_BRANCH=$(echo "$GITHUB_EVENT_PATH" | jq -r .head.ref)

echo "Base branch for PR #$PR_NUMBER is $BASE_BRANCH"

if [[ "$BASE_REPO" != "$HEAD_REPO" ]]; then
	echo "PRs from forks are not supported at the moment."
	exit 1
fi

git remote set-url origin https://x-access-token:$GITHUB_TOKEN@github.com/$GITHUB_REPOSITORY.git
git config --global user.email "action@github.com"
git config --global user.name "GitHub Action"

set -o xtrace

# make sure branches are up-to-date
git fetch origin $BASE_BRANCH
git fetch origin $HEAD_BRANCH

# do the rebase
git checkout -b $HEAD_BRANCH origin/$HEAD_BRANCH
git rebase origin/$BASE_BRANCH

# push back
git push --force-with-lease