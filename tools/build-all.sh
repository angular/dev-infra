#!/bin/bash

# Bash script to build all packages and modules in the dev-infra repository.
set -e

# Ensure the script runs from the repository root.
cd "$(dirname "$0")/.."

# Build the ng-dev npm package using Bazel in release mode.
echo "Building //ng-dev:npm_package..."
pnpm bazel build //ng-dev:npm_package --config=release

# Package each rule module by creating a git archive and extracting it.
# This ensures that only tracked files are included in the output.
mkdir -p dist

# Create a temporary tree-ish that includes uncommitted changes.
# If no changes exist, git stash create returns empty, so we fall back to HEAD.
tree_ish=$(git stash create)
if [ -z "$tree_ish" ]; then
  tree_ish="HEAD"
fi

for rule_path in bazel/rules/rules_*; do
  if [ -d "$rule_path" ]; then
    rule_name=$(basename "$rule_path")
    target_dir="dist/rules/$rule_name"

    echo "Packaging $rule_name into $target_dir..."

    # Ensure target directory exists and is empty
    rm -rf "$target_dir"
    mkdir -p "$target_dir"

    # Archive the content of the rule directory and extract it into dist.
    git archive "$tree_ish":"$rule_path" | tar -x -C "$target_dir"
  fi
done

echo "Build all completed successfully."
