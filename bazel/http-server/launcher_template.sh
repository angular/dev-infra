#!/usr/bin/env bash

# --- begin runfiles.bash initialization v2 ---
# Copy-pasted from the Bazel Bash runfiles library v2. We need to copy the runfile
# helper code as we want to resolve Bazel targets through the runfiles (in order to
# make the server work on windows where runfiles are not symlinked). The runfile
# helpers expose a bash function called "rlocation" that can be used to resolve targets.
set -uo pipefail; f=bazel_tools/tools/bash/runfiles/runfiles.bash
source "${RUNFILES_DIR:-/dev/null}/$f" 2>/dev/null || \
source "$(grep -sm1 "^$f " "${RUNFILES_MANIFEST_FILE:-/dev/null}" | cut -f2- -d' ')" 2>/dev/null || \
source "$0.runfiles/$f" 2>/dev/null || \
source "$(grep -sm1 "^$f " "$0.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
source "$(grep -sm1 "^$f " "$0.exe.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
{ echo>&2 "ERROR: cannot find $f"; exit 1; }; f=; set -e
# --- end runfiles.bash initialization v2 ---

# Resolve the path of the server binary.
serverBin=$(rlocation "devinfra/bazel/http-server/server_bin_/server_bin")

# Start the server with the given arguments. The arguments will be
# substituted based on the rule attributes.
${serverBin} TEMPLATED_args "$@"
