load("@npm//@bazel/concatjs:index.bzl", _ts_library = "ts_library")
load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")
load("//bazel/esbuild:index.bzl", _esbuild = "esbuild", _esbuild_config = "esbuild_config")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", _pkg_npm = "pkg_npm")
load("//tools/jasmine:jasmine.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@angular/bazel:index.bzl", _ng_module = "ng_module")

esbuild_config = _esbuild_config
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

def esbuild(**kwargs):
    _esbuild(
        platform = "node",
        target = "node12",
        **kwargs
    )

def esbuild_checked_in(name, **kwargs):
    esbuild(
        name = "%s_generated" % name,
        # Unfortunately we need to omit source maps from the checked-in files as these
        # will vary based on the platform. See more details below in the sanitization
        # genrule transformation. It is acceptable not having source-maps for the checked-in
        # files as those are not minified and its to debug, the checked-in file can be visited.
        sourcemap = "external",
        # We always disable minification for checked-in files as otherwise it will
        # become difficult determining potential differences. e.g. on Windows ESBuild
        # accidentally included `source-map-support` due to the missing sandbox.
        minify = False,
        **kwargs
    )

    # ESBuild adds comments and function identifiers with the name of their module
    # location. e.g. `"bazel-out/x64_windows-fastbuild/bin/node_modules/a"function(exports)`.
    # We strip all of these paths as that would break approval of the he checked-in files within
    # different platforms (e.g. RBE running with K8). Additionally these paths depend
    # on the non-deterministic hoisting of the package manager across all platforms.
    native.genrule(
        name = "%s_sanitized" % name,
        srcs = ["%s_generated.js" % name],
        outs = ["%s_sanitized.js" % name],
        cmd = """cat $< | sed -E "s#(bazel-out|node_modules)/[^\\"']+##g" > $@""",
    )

    generated_file_test(
        name = name,
        src = "%s.js" % name,
        generated = "%s_sanitized.js" % name,
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
