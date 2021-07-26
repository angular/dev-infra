load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")
load("@build_bazel_rules_nodejs//:index.bzl", _pkg_npm = "pkg_npm")

def jasmine_node_test(name, use_direct_specs = True, **kwargs):
    _jasmine_node_test(
        name = name,
        use_direct_specs = use_direct_specs,
        **kwargs
    )

def ts_project(**kwargs):
    _ts_project(
        tsconfig = "//tools:tsconfig",
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
        deps.append('package-json')

    _pkg_npm(
        deps = deps,
        **kwargs
    )
