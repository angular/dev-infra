load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")

def jasmine_node_test(name, specs = [], **kwargs):
    templated_args = kwargs.pop("templated_args", []) + [
        # Include our jasmime bootstrap file to be run before the jasmine runner.
        "--node_options=--require=$$(rlocation $(rootpath //tools/jasmine:bootstrap))",
    ]

    _jasmine_node_test(
        name = name,
        srcs = kwargs.pop("srcs", []) + specs,
        use_direct_specs = True,
        deps = kwargs.pop("deps", []) + [
            "//tools/jasmine:bootstrap",
            # Because we don't provided a bundled script, we must ensure that the dependencies for
            # bootstrap are also included as dependencies.
            "//tools/jasmine:bootstrap_dependencies",
        ],
        templated_args = templated_args,
        **kwargs
    )
