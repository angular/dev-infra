load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")
load("//bazel/spec-bundling:index.bzl", "spec_bundle")

def jasmine_node_test(name, specs = [], external = [], bootstrap = ["//tools/jasmine:bootstrap"], **kwargs):
    templated_args = kwargs.pop("templated_args", []) + [
        # TODO: Disable the linker fully here. Currently it is needed for ESM.
        "--bazel_patch_module_resolver",
    ]

    spec_bundle(
        name = "%s_test_bundle" % name,
        platform = "node",
        target = "es2020",
        bootstrap = bootstrap,
        deps = specs,
        external = external,
    )

    _jasmine_node_test(
        name = name,
        srcs = [":%s_test_bundle" % name],
        use_direct_specs = True,
        templated_args = templated_args,
        **kwargs
    )
