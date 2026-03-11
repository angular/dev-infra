#!/bin/bash

echo "Starting synchronization of all Bazel modules..."

# Find all MODULE.bazel files, excluding node_modules, dist, and bazel-out
find . -name "MODULE.bazel" -not -path "*/node_modules/*" -not -path "*/dist/*" -not -path "*/bazel-out/*" -print0 | while IFS= read -r -d '' module_file; do
  dir=$(dirname "$module_file")
  
  echo "****************************************************************"
  echo "Processing: $dir"
  echo "****************************************************************"

  # Execute commands in a subshell
  (
    cd "$dir"
    
    # Update Bazel module dependencies and lockfile
    echo "Updating Bazel dependencies..."
    bazel mod deps --lockfile_mode=update
    
    # If a package.json exists AND it contains an ng-dev script, sync module bazel
    if [[ -f "package.json" ]] && grep -q '"ng-dev":' package.json; then
      echo "package.json and ng-dev script detected. Running pnpm ng-dev misc sync-module-bazel..."
      # Use a subshell to capture errors and prevent script termination if one fails
      ( pnpm ng-dev misc sync-module-bazel ) || echo "Warning: Sync failed for $dir"
    elif [[ -f "package.json" ]]; then
      echo "package.json found but no ng-dev script detected. Skipping sync-module-bazel."
    fi

  )
  
  echo -e "Finished processing: $dir\n"
done

echo "All modules synchronized successfully."
