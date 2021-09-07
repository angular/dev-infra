load("@npm//@bazel/jasmine:index.bzl", _jasmine_node_test = "jasmine_node_test")

def jasmine_node_test(name, specs = [], **kwargs):
    templated_args = kwargs.pop("templated_args", []) + [
        # Include our jasmime bootstrap file to be run before the jasmine runner.
        "--node_options=--require=$$(rlocation $(rootpath //tools/jasmine:bootstrap_init))",
    ]

    _jasmine_node_test(
        name = name,
        srcs = kwargs.pop("srcs", []) + specs,
        use_direct_specs = True,
        deps = kwargs.pop("deps", []) + [
            "//tools/jasmine:bootstrap",
            "//tools/jasmine:bootstrap_init",
        ],
        templated_args = templated_args,
        **kwargs
    )
