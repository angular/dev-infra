#!/bin/bash
set -e

echo "Starting synchronization of all Bazel modules..."

# Update the root lockfile. This is needed for the sync-module-bazel command to work.
bazel mod deps --lockfile_mode=update

# Find and store all MODULE.bazel directories
module_dirs=()
while IFS= read -r -d '' module_file; do
  module_dirs+=("$(dirname "$module_file")")
done < <(find . -name "MODULE.bazel" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/bazel-out/*" -print0)

# Synchronize MODULE.bazel content with package.json and .nvmrc.
echo "Synchronizing MODULE.bazel content..."
for dir in "${module_dirs[@]}"; do
  echo "Processing (Sync): $dir"
  if [[ -f "$dir/package.json" ]] && grep -q '"ng-dev":' "$dir/package.json"; then
    (
      cd "$dir"
      pnpm ng-dev misc sync-module-bazel
    )

    # Update the root lockfile. This is needed for the sync-module-bazel command to work due to circular dependencies.
    bazel mod deps --lockfile_mode=update
  fi
done

# Update Bazel lockfiles for each module due to circular dependencies.
echo "Updating Bazel lockfiles..."
for dir in "${module_dirs[@]}"; do
  echo "Processing (Lockfile): $dir"
  (
    cd "$dir"
    bazel mod deps --lockfile_mode=update
  )
done

echo "All modules synchronized successfully."