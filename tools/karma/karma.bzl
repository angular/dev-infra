load("//bazel/karma:index.bzl", _karma_web_test_suite = "karma_web_test_suite")
load("//bazel/spec-bundling:index.bzl", "spec_bundle")

def karma_web_test(name, specs = [], external = [], **kwargs):
    spec_bundle(
        name = "%s_test_bundle" % name,
        platform = "browser",
        workspace_name = "dev-infra",
        bootstrap = ["//tools/karma:bootstrap"],
        deps = specs,
        external = external,
    )

    _karma_web_test_suite(
        name = name,
        deps = [":%s_test_bundle" % name],
        **kwargs
    )
