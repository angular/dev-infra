"""Helper rules for building CircleCI orbs with the help of Bazel."""

load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")

def nodejs_script_to_sh_script(name, output_file, bundle_file):
    """Rule that takes a NodeJS script and wraps it into a Bash script.

      This is useful for inclusion in CircleCI `run` commands in Orbs because
      there cannot be an external NodeJS script file, or direct NodeJS `run` commands.
    """

    npm_package_bin(
        name = name,
        tool = "//circleci-orb:pack_orb_script",
        data = [bundle_file],
        outs = [output_file],
        args = ["$(location %s)" % bundle_file, "$@"],
    )
