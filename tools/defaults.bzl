load("@npm//@bazel/typescript:index.bzl", _ts_library = "ts_library", _ts_project = "ts_project")
load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", _pkg_npm = "pkg_npm")
load("//tools/jasmine:jasmine.bzl", _jasmine_node_test = "jasmine_node_test")

jasmine_node_test = _jasmine_node_test

def ts_project(**kwargs):
    _ts_project(
        tsconfig = "//:tsconfig",
        **kwargs
    )

def ts_library(name, testonly = False, deps = [], srcs = [], **kwargs):
    deps = deps + ["@npm//tslib"]
    if testonly:
        deps.append("@npm//@types/jasmine")
        deps.append("@npm//@types/node")

    _ts_library(
        name = name,
        devmode_module = "commonjs",
        devmode_target = "es2020",
        prodmode_module = "commonjs",
        prodmode_target = "es2020",
        tsconfig = kwargs.pop("tsconfig", "//:tsconfig"),
        testonly = testonly,
        deps = deps,
        srcs = srcs,
        module_name = kwargs.pop("module_name", native.package_name()),
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
        sourcemap = "inline",
        # We always disable minification for checked-in files as otherwise it will
        # become difficult determining potential differences. e.g. on Windows ESBuild
        # accidentally included `source-map-support` due to the missing sandbox.
        minify = False,
        **kwargs
    )

    # ESBuild adds comments and function identifiers with the name of their module
    # location. e.g. `"bazel-out/x64_windows-fastbuild"function(exports)`. We strip
    # any of these `bazel-out` specific paths as that would break approval of the
    # the checked-in files within different platforms. e.g. RBE running with K8.
    native.genrule(
        name = "%s_sanitized" % name,
        srcs = ["%s_generated.js" % name],
        outs = ["%s_sanitized.js" % name],
        cmd = """cat $< | sed "s#bazel-out/[^/]*/##g" > $@""",
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
