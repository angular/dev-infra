"Support code used by macros in this package"

load("@aspect_rules_js//js:defs.bzl", "js_binary")
load("@bazel_lib//lib:directory_path.bzl", "directory_path")

TEST_PATTERNS = [
    "src/**/*.spec.ts",
    "src/test.ts",
    "dist/",
]

# Syntax sugar:
# Reproduce the behavior of the logic a user would get from
# load("@npm//angular:@angular/cli/package_json.bzl", angular_cli = "bin")
def ng_entry_point(name, node_modules):
    entry_point_target = "_{}.ng_entry_point".format(name)
    directory_path(
        name = entry_point_target,
        directory = "{}/@angular/cli/dir".format(node_modules),
        path = "bin/ng.js",
    )
    return entry_point_target

# buildifier: disable=function-docstring
def ng_bin(name, node_modules, **kwargs):
    js_binary(
        name = name,
        data = ["{}/@angular/cli".format(node_modules)],
        entry_point = ng_entry_point(name, node_modules),
        **kwargs
    )
