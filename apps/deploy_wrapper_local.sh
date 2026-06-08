#!/usr/bin/env bash
set -e

# Navigate to the directory where the script is running
cd "$(dirname "$0")"

REPO_ROOT=$(readlink -f "$(git rev-parse --show-toplevel)")

is_under_repo() {
  local path="$1"
  [[ -n "$REPO_ROOT" ]] && [[ "$path" == "$REPO_ROOT" || "$path" == "$REPO_ROOT"/* ]]
}

if [ -L functions/node_modules/firebase-functions ]; then
    ABS_TARGET=$(readlink -f functions/node_modules/firebase-functions)
    
    if ! is_under_repo "$ABS_TARGET"; then
        echo "Error: firebase-functions target is outside of the repository root: $ABS_TARGET" >&2
        exit 1
    fi

    VIRTUAL_NODE_MODULES=$(readlink -f "$(dirname "$ABS_TARGET")")
    if ! is_under_repo "$VIRTUAL_NODE_MODULES"; then
        echo "Error: VIRTUAL_NODE_MODULES is outside of the repository root: $VIRTUAL_NODE_MODULES" >&2
        exit 1
    fi

    echo "Materializing firebase-functions symlink..."
    rm functions/node_modules/firebase-functions
    cp -rL "$ABS_TARGET" functions/node_modules/firebase-functions
    
    echo "Creating symlinks for dependencies from $VIRTUAL_NODE_MODULES..."
    for dep in "$VIRTUAL_NODE_MODULES"/*; do
        if [ -e "$dep" ]; then
            dep_name=$(basename "$dep")
            if [ "$dep_name" != "firebase-functions" ]; then
                dep_target=$(readlink -f "$dep")
                if ! is_under_repo "$dep_target"; then
                    echo "Error: Dependency target $dep_name ($dep_target) is outside of the repository root." >&2
                    exit 1
                fi
                rm -rf "functions/node_modules/$dep_name"
                ln -sf "$dep_target" "functions/node_modules/$dep_name"
            fi
        fi
    done
fi

# Create .bin directory and symlink for firebase-functions executable
# firebase-tools explicitly searches for .bin/firebase-functions to locate the SDK
echo "Creating .bin/firebase-functions symlink..."
mkdir -p functions/node_modules/.bin
ln -sf ../firebase-functions/lib/bin/firebase-functions.js functions/node_modules/.bin/firebase-functions
chmod +x functions/node_modules/.bin/firebase-functions

# Fix package.json to match CommonJS bundle format
echo "Removing type: module from package.json..."
sed -i '/"type": "module"/d' functions/package.json

echo "Running firebase deploy..."
npx -p firebase-tools firebase deploy --project internal-200822 --config firebase.json
