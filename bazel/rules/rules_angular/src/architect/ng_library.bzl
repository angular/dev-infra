"Macro definition to package an angular library"

load("@aspect_rules_js//js:defs.bzl", "js_library", "js_run_binary")
load("@jq.bzl//jq:jq.bzl", "jq")
load(":utils.bzl", "TEST_PATTERNS", "ng_bin")

# Idiomatic configuration files created by `ng generate`
LIBRARY_CONFIG = [
    ":tsconfig.lib.json",
    ":tsconfig.lib.prod.json",
    ":package.json",
]

NPM_DEPS = lambda node_modules: ["/".join([node_modules, s]) for s in [
    "@angular/build",
    "@angular/common",
    "@angular/compiler",
    "@angular/compiler-cli",
    "@angular/core",
    "rxjs",
    "tslib",
    "ng-packagr",
]]

def ng_library(name, node_modules, ng_config, project_name = None, srcs = [], deps = [], **kwargs):
    """
    Bazel macro for compiling an NG library project that was produced by 'ng generate library'.

    Args:
      name: the rule name
      node_modules: users installed and linked angular dependencies
      project_name: the Angular CLI project name, defaults to current directory name
      srcs: angular source files: typescript, HTML, and styles
      deps: dependencies of the library
      ng_config: root configurations (angular.json, tsconfig.json)
      **kwargs: extra args passed to main Angular CLI rules
    """
    srcs = srcs or native.glob(["src/**/*"], exclude = TEST_PATTERNS)

    project_name = project_name or native.package_name().split("/").pop()
    build_target = "{}.build".format(name)

    # NOTE: dist directories are under the project dir instead of the Angular CLI default of the root dist folder
    jq(
        name = "ng-package",  # outputs ng-package.json. Can only have one per package.
        srcs = ["ng-package.json"],
        # Replace the destination, without modifying original sources so they still work outside Bazel.
        filter = """.dest = "dist" """,
        visibility = ["//visibility:private"],
    )

    ng_bin(
        name = "_%s.ng_cli" % name,
        node_modules = node_modules,
    )

    js_run_binary(
        name = build_target,
        chdir = native.package_name(),
        args = ["build", project_name],
        out_dirs = ["dist"],
        tool = ":_%s.ng_cli" % name,
        srcs = srcs + deps + NPM_DEPS(node_modules) + LIBRARY_CONFIG + [ng_config, "ng-package"],
        mnemonic = "NgBuild",
        visibility = ["//visibility:private"],
        **kwargs
    )

    # Output the compiled library and its dependencies
    js_library(
        name = name,
        srcs = [build_target],
        deps = deps,
    )
