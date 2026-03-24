#!/usr/bin/env bash
set -e

# Navigate to the directory where the script is running
cd "$(dirname "$0")"

if [ -L functions/node_modules/firebase-functions ]; then
    TARGET=$(readlink functions/node_modules/firebase-functions)
    VIRTUAL_NODE_MODULES="functions/node_modules/$(dirname "$TARGET")"
    echo "Materializing firebase-functions symlink..."
    rm functions/node_modules/firebase-functions
    cp -rL "functions/node_modules/$TARGET" functions/node_modules/firebase-functions
    
    echo "Creating symlinks for dependencies from $VIRTUAL_NODE_MODULES..."
    for dep in "$VIRTUAL_NODE_MODULES"/*; do
        dep_name=$(basename "$dep")
        if [ "$dep_name" != "firebase-functions" ]; then
            dep_target=$(readlink -f "$dep")
            rm -rf "functions/node_modules/$dep_name"
            ln -sf "$dep_target" "functions/node_modules/$dep_name"
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
