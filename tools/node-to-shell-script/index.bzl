"""Helper rule for making a IIEF in a shell script from a node script with the help of Bazel."""

load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")

def nodejs_script_to_sh_script(name, output_file, bundle_file):
    """Rule that takes a NodeJS script and wraps it into a Bash script."""

    npm_package_bin(
        name = name,
        tool = "//tools/node-to-shell-script",
        data = [bundle_file],
        outs = [output_file],
        args = ["$(location %s)" % bundle_file, "$@"],
    )
