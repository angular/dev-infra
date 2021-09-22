load("@npm//@bazel/typescript:index.bzl", _ts_library = "ts_library", _ts_project = "ts_project")
load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", "js_library", "npm_package_bin", _pkg_npm = "pkg_npm")
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

def generate_ts_proto_module(name, protofile, visibility = ["//visibility:public"]):
    """
    Generate a typescript module for decoding a proto binary file based on a provided .proto file.
    """
    protobufjs_dependencies = [
        "@npm//semver",
        "@npm//chalk",
        "@npm//jsdoc",
        "@npm//minimist",
        "@npm//uglify-js",
    ]
    js_file = name + "_pb.js"
    d_ts_file = name + "_pb.d.ts"

    npm_package_bin(
        name = "generate_js_" + name,
        tool = "@npm//protobufjs/bin:pbjs",
        data = protobufjs_dependencies + [
            protofile,
        ],
        testonly = True,
        args = [
            "-t",
            "static-module",
            "-w",
            "commonjs",
            "$(rootpath %s)" % protofile,
        ],
        stdout = "generated_" + js_file,
    )

    npm_package_bin(
        name = "generate_ts_" + name,
        tool = "@npm//protobufjs/bin:pbts",
        data = protobufjs_dependencies + [
            ":generate_js_%s" % name,
        ],
        testonly = True,
        args = [
            "$(execpath :generate_js_%s)" % name,
        ],
        stdout = "generated_" + d_ts_file,
    )

    generated_file_test(
        name = name + "_dts",
        src = d_ts_file,
        testonly = True,
        generated = "generated_" + d_ts_file,
    )

    generated_file_test(
        name = name + "_js",
        testonly = True,
        src = js_file,
        generated = "generated_" + js_file,
    )

    js_library(
        name = name,
        srcs = [
            d_ts_file,
            js_file,
        ],
        deps = [
            "@npm//protobufjs",
        ],
        visibility = visibility,
    )
