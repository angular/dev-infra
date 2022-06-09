load("@npm//@bazel/concatjs:index.bzl", _ts_library = "ts_library")
load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")
load("@npm//@angular/bazel:index.bzl", _ng_module = "ng_module")
load("@build_bazel_rules_nodejs//:index.bzl", _pkg_npm = "pkg_npm")
load("//tools/jasmine:jasmine.bzl", _jasmine_node_test = "jasmine_node_test")
load(
    "//tools:esbuild.bzl",
    _esbuild = "esbuild",
    _esbuild_checked_in = "esbuild_checked_in",
    _esbuild_config = "esbuild_config",
    _esbuild_esm_bundle = "esbuild_esm_bundle",
)

esbuild = _esbuild
esbuild_config = _esbuild_config
esbuild_esm_bundle = _esbuild_esm_bundle
esbuild_checked_in = _esbuild_checked_in

jasmine_node_test = _jasmine_node_test

def _get_module_name(testonly):
    if testonly:
        return None

    return "@angular/dev-infra-private/%s" % native.package_name()

def ts_project(**kwargs):
    _ts_project(
        tsconfig = "//:tsconfig",
        **kwargs
    )

def ts_library(name, testonly = False, deps = [], srcs = [], devmode_module = None, **kwargs):
    deps = deps + ["@npm//tslib"]
    if testonly:
        deps.append("@npm//@types/jasmine")
        deps.append("@npm//@types/node")

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
        module_name = kwargs.pop("module_name", _get_module_name(testonly)),
        package_name = kwargs.pop("package_name", _get_module_name(testonly)),
        **kwargs
    )

def pkg_npm(build_package_json_from_template = False, deps = [], **kwargs):
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
    _ng_module(
        name = name,
        tsconfig = kwargs.pop("tsconfig", "//:tsconfig"),
        **kwargs
    )
