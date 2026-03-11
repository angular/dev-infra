#!/usr/bin/env bash


set -e -o pipefail

function suppress_on_success {
   TMP=$(mktemp)
   if ! (${1+"$@"} &> "$TMP"); then
      cat $TMP
      rm $TMP
      exit 1
   fi
   rm $TMP
}

# find path to the Angular CLI executable.
RUNFILES="$(realpath $0.runfiles)"
NG_CLI_TOOL="$RUNFILES/$NG_CLI_TOOL_RUNFILES_PATH"

# Copy Angular CLI boilerplate.
cp -Rf -L $BOILERPLATE_DIR/* $OUT_DIR

# Copy user files.
cp -Rf -L $INPUT_PACKAGE/* $OUT_DIR/src/

# Prepare for `angular.json` to be modified below.
unlink $OUT_DIR/angular.json
cat $BOILERPLATE_DIR/angular.json | tee $OUT_DIR/angular.json &> /dev/null

# Adjust `angular.json` to point to configured entry-point.
$YQ_BIN -o=json "
      .projects.boilerplate.architect.build.options.browser = \"src/$CURRENT_PACKAGE/main.ts\" |
      .projects.boilerplate.sourceRoot = \"src/$CURRENT_PACKAGE\"
   " \
   -i $OUT_DIR/angular.json

# Disable budgets. The action should never fail on size increases / or larger apps.
$YQ_BIN -o=json "del(.projects.boilerplate.architect.build.configurations.production.budgets)" -i $OUT_DIR/angular.json

# Support for custom JQ config filters specified via Starlark.
if [ "$JQ_CONFIG_FILTER" != "" ]; then
   $YQ_BIN -o=json "$JQ_CONFIG_FILTER" -i $OUT_DIR/angular.json
fi

# If `zone.js` is not configured to be included, filter it out of the project.
if [ "$INCLUDE_ZONEJS" == "False" ]; then
   $YQ_BIN -o=json \
      ".projects.boilerplate.architect.build.options.polyfills |= map(select(. != \"zone.js\"))" \
      -i $OUT_DIR/angular.json
fi

# Run the build. Only print output on failure.
cd $OUT_DIR
suppress_on_success $NG_CLI_TOOL build --preserve-symlinks --output-hashing=none --no-progress --no-index --configuration=production

