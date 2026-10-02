"Macro definition to build a library"

load("@aspect_rules_js//js:defs.bzl", "js_run_binary")
load(":utils.bzl", "TEST_PATTERNS", "ng_bin")

# Idiomatic configuration files created by `ng generate`
LIBRARY_CONFIG = [
    ":tsconfig.lib.json",
    ":package.json",
]

# Typical dependencies of angular libs
NPM_DEPS = lambda node_modules: ["/".join([node_modules, s]) for s in [
    "@angular/build",
    "@angular/common",
    "@angular/compiler",
    "@angular/compiler-cli",
    "@angular/core",
    "rxjs",
    "tslib",
]]

def ng_library(
        name,
        node_modules,
        ng_config,
        project_name = None,
        args = [],
        srcs = [],
        deps = [],
        **kwargs):
    """
    Bazel macro for compiling an NG library project. Creates {name} target.

    Args:
      name: the rule name
      node_modules: users installed and linked angular dependencies
      project_name: the Angular CLI project name, to the rule name
      args: Extra arguments to pass to `ng build`.
      srcs: library source files: typescript, HTML, and styles
      ng_config: angular workspace root configs
      deps: dependencies of the library, typically ng_library rules
      **kwargs: extra args passed to main Angular CLI rules
    """
    srcs = srcs or native.glob(["src/**/*"], exclude = TEST_PATTERNS)
    deps = deps + NPM_DEPS(node_modules) + LIBRARY_CONFIG + [ng_config]
    project_name = project_name if project_name else name

    ng_bin(
        name = "_%s.ng_cli" % name,
        node_modules = node_modules,
    )

    tool = ":_%s.ng_cli" % name

    js_run_binary(
        name = name,
        chdir = native.package_name(),
        args = ["build", project_name] + args,
        out_dirs = ["dist"],
        tool = tool,
        srcs = srcs + deps,
        **kwargs
    )
