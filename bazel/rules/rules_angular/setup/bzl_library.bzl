"Workaround for https://github.com/bazelbuild/bazel-skylib/pull/571"

load("@bazel_skylib//:bzl_library.bzl", _bzl_library = "bzl_library")
load("@bazel_skylib//rules:build_test.bzl", "build_test")

def bzl_library(name, srcs, deps = [], visibility = None):
    _bzl_library(
        name = name,
        srcs = srcs,
        deps = deps,
        visibility = visibility,
    )
    if hasattr(native, "starlark_doc_extract"):
        # Verify the deps of the bzl_library cover the load statements
        # This ought to be a validation action instead.
        targets = []
        for i, src in enumerate(srcs):
            target = "_{}.doc_extract{}".format(name, i if i > 0 else "")
            native.starlark_doc_extract(
                name = target,
                src = src,
                deps = deps,
            )
            targets.append(target)
        build_test(
            name = "{}_test".format(name),
            targets = targets,
        )
