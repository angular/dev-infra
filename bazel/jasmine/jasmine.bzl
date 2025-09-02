load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")

def jasmine_test(name, data = [], tsconfig = None, node_options = [], env = {}, **kwargs):
    if tsconfig:
        env = dict(env, **{
            "NODE_OPTIONS_TSCONFIG_PATH": "$(rlocationpath %s)" % tsconfig,
        })

    _jasmine_test(
        name = name,
        data = data + [
            "@devinfra//bazel/jasmine:stack-traces",
            "@devinfra//bazel/private/node_loader:node_loader",
        ],
        env = env,
        size = kwargs.pop("size", "medium"),
        node_options = [
            "--import=$$JS_BINARY__RUNFILES/$(rlocationpath @devinfra//bazel/private/node_loader:node_loader)",
            "--import=$$JS_BINARY__RUNFILES/$(rlocationpath @devinfra//bazel/jasmine:stack-traces)",
        ] + node_options,
        **kwargs
    )
