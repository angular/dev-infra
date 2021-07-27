load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/typescript:index.bzl", _ts_library = "ts_library", _ts_project = "ts_project")
load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", _pkg_npm = "pkg_npm")

def jasmine_node_test(name, specs = [], **kwargs):
    _jasmine_node_test(
        name = name,
        srcs = kwargs.pop("srcs", []) + specs,
        deps = kwargs.pop("deps", []),
        use_direct_specs = True,
        **kwargs
    )

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

def esbuild(
        name,
        entry_point,
        minify = True,
        sourcemap = "inline",
        save_to_repo = False,
        external = [],
        deps = []):
    _esbuild(
        name = "%s_generated" % name,
        entry_point = entry_point,
        external = external,
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
