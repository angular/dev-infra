load("@npm//@bazel/concatjs:index.bzl", _ts_library = "ts_library")
load("@npm//@angular/bazel:index.bzl", _ng_module = "ng_module")
load("@build_bazel_rules_nodejs//:index.bzl", _pkg_npm = "pkg_npm")
load("//tools/jasmine:jasmine.bzl", _jasmine_node_test = "jasmine_node_test")
load("//tools/karma:karma.bzl", _karma_web_test = "karma_web_test")
load(
    "//tools:esbuild.bzl",
    _esbuild = "esbuild",
    _esbuild_checked_in = "esbuild_checked_in",
    _esbuild_cjs_bundle = "esbuild_cjs_bundle",
    _esbuild_config = "esbuild_config",
    _esbuild_esm_bundle = "esbuild_esm_bundle",
)
load("//:package.bzl", "BZL_DEFAULTS_ALLOW_PACKAGES")

esbuild = _esbuild
esbuild_config = _esbuild_config
esbuild_esm_bundle = _esbuild_esm_bundle
esbuild_checked_in = _esbuild_checked_in
esbuild_cjs_bundle = _esbuild_cjs_bundle

jasmine_node_test = _jasmine_node_test
karma_web_test = _karma_web_test

def _assert_defaults_allowed_for_caller():
    current_pkg = native.package_name()

    for allow_package in BZL_DEFAULTS_ALLOW_PACKAGES:
        if current_pkg.startswith("%s/" % allow_package) or \
           current_pkg == allow_package:
            return

    # For `test/` or `tests/` packages in forbidden Bazel packages, we allow usage
    # of defaults. This check is not fully reliable but sufficient to avoid easy mistakes.
    if "test/" in current_pkg or current_pkg.endswith("test") or \
       "tests/" in current_pkg or current_pkg.endswith("tests"):
        return

    fail("Cannot use `defaults.bzl` from within %s" % current_pkg)

def _get_module_name(testonly, user_module_name):
    if testonly:
        return None

    current_pkg = native.package_name()

    if current_pkg.startswith("ng-dev") and user_module_name == None:
        # We only auto-generate the `module_name` for targets in `ng-dev`. Other targets should
        # have an explicit `module_name` as we cannot rely on this macro in consumer workspaces.
        return "@angular/ng-dev/%s" % current_pkg

    return None

def ts_library(name, testonly = False, deps = [], srcs = [], devmode_module = None, module_name = None, **kwargs):
    _assert_defaults_allowed_for_caller()
    deps = deps + ["@npm//tslib"]

    _ts_library(
        name = name,
        devmode_module = devmode_module if devmode_module != None else "esnext",
        devmode_target = "es2020",
        prodmode_module = "esnext",
        prodmode_target = "es2020",
        tsconfig = kwargs.pop("tsconfig", "//:tsconfig"),
        testonly = testonly,
        deps = deps,
        srcs = srcs,
        module_name = kwargs.pop("module_name", _get_module_name(testonly, module_name)),
        package_name = kwargs.pop("package_name", _get_module_name(testonly, module_name)),
        **kwargs
    )

def pkg_npm(build_package_json_from_template = False, deps = [], **kwargs):
    _assert_defaults_allowed_for_caller()

    if build_package_json_from_template:
        native.genrule(
            name = "package-json",
            srcs = [
                "package.json.tmpl",
                "//:package.json",
            ],
            outs = ["package.json"],
            cmd = """
                $(execpath //tools:inline-package-json-deps) $(execpath package.json.tmpl) \
                    $(execpath //:package.json) $@
            """,
            tools = ["//tools:inline-package-json-deps"],
        )
        deps.append("package-json")

    _pkg_npm(
        deps = deps,
        **kwargs
    )

def ng_module(name, **kwargs):
    _assert_defaults_allowed_for_caller()

    _ng_module(
        name = name,
        tsconfig = kwargs.pop("tsconfig", "//:tsconfig"),
        **kwargs
    )
