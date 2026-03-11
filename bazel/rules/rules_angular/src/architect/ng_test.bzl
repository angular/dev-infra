"Macro definition to execute a test"

load("@aspect_rules_js//js:defs.bzl", "js_test")
load(":utils.bzl", "ng_entry_point")

# Idiomatic configuration files created by `ng generate`
TEST_CONFIG = [
    ":tsconfig.spec.json",
]

NPM_DEPS = lambda node_modules: ["/".join([node_modules, s]) for s in [
    "@angular",  # Take all of them, since the list varies across angular versions
    "tslib",
    "rxjs",
]]

def ng_test(name, node_modules, ng_config, args = [], project_name = None, srcs = [], deps = [], **kwargs):
    """
    Bazel macro for compiling an NG library project.

    Args:
      name: the rule name
      node_modules: users installed and linked angular dependencies
      srcs: list of labels of source files to include
      args: Additional command line flags to be passed to `ng test`.
      project_name: the Angular CLI project name, defaults to current directory name
      deps: additional dependencies for tests
      ng_config: root configurations (angular.json, tsconfig.json)
      **kwargs: extra args passed to main Angular CLI rules
    """
    srcs = srcs or native.glob(["src/**/*"], exclude = ["dist/"])
    deps = deps + NPM_DEPS(node_modules)

    project_name = project_name if project_name else native.package_name().split("/").pop()

    js_test(
        name = name,
        chdir = native.package_name(),
        args = ["test", project_name, "--no-watch"] + args,
        entry_point = ng_entry_point(name, node_modules),
        data = srcs + deps + TEST_CONFIG + [
            ng_config,
        ],
        **kwargs
    )
