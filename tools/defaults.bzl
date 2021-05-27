load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("@npm//@bazel/typescript:index.bzl", _ts_project = "ts_project")

def jasmine_node_test(name, **kwargs):
    _jasmine_node_test(
        name = name,
        use_direct_specs = True,
        **kwargs
    )

def ts_project(**kwargs):
    _ts_project(
        tsconfig = "//tools:tsconfig",
        **kwargs
    )
