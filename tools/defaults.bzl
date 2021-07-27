load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/typescript:index.bzl", _ts_library = "ts_library", _ts_project = "ts_project")
load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")

def jasmine_node_test(name, specs = [], **kwargs):
    native.filegroup(
        name = "%s_js_files",
        srcs = specs,
        testonly = True,
        output_group = "es5_sources",
    )

    _jasmine_node_test(
        name = name,
        srcs = kwargs.pop("srcs", []) + ["%s_js_files"],
        deps = kwargs.pop("deps", []) + specs,
        use_direct_specs = True,
        **kwargs
    )

def ts_project(**kwargs):
    _ts_project(
        tsconfig = "//tools:tsconfig",
        **kwargs
    )

def ts_library(name, testonly = False, deps = [], **kwargs):
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
        tsconfig = "//tools:tsconfig",
        testonly = testonly,
        deps = deps,
        module_name = kwargs.pop("module_name", native.package_name()),
        **kwargs
    )

def esbuild(name, entry_point, minify = True, sourcemap = "inline",
            save_to_repo = False, deps = []):
    _esbuild(
        name = "%s_generated" % name,
        entry_point = entry_point,
        deps = deps,
        platform = "node",
        target = "node12",
        minify = minify,
        sourcemap = sourcemap,
    )

    if save_to_repo:
        generated_file_test(
            name = name,
            src = "%s.js" % name,
            generated = "%s_generated.js" % name,
        )
