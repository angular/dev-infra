load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")

def jasmine_test(name, data = [], node_options = [], **kwargs):
    _jasmine_test(
        name = name,
        data = data + [
            "@devinfra//bazel/jasmine:stack-traces",
        ],
        size = kwargs.pop("size", "medium"),
        node_options = [
            "--import",
            "$$JS_BINARY__RUNFILES/$(rlocationpath @devinfra//bazel/jasmine:stack-traces)",
        ] + node_options,
        **kwargs
    )
