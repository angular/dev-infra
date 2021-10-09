load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")

def _serialize_file(file):
    """Serializes a file into a struct that matches the `BazelFileInfo` type in the
      packager implementation. Useful for transmission of such information."""

    return struct(path = file.path, shortPath = file.short_path)

def _split_and_expand_command(ctx, command):
    """Splits a command into the binary and its arguments. Also Bazel locations are expanded."""
    expanded_command = ctx.expand_location(command, targets = ctx.attr.data)
    return expanded_command.split(" ", 1)

def _unwrap_label_keyed_mappings(dict, description):
    """Unwraps a label-keyed dictionary used for expressing mappings into a JSON-serializable
    dictionary that will match the `Record<string, BazelFileInfo>` type as in the test
    runner. Additionally, the list of referenced mapping files is returned so that these
    can be added to the runfiles of the tool relying on the serialized mappings.

    This helper is used for serializing the `npm_packages` and `tool_mappings`
    dictionaries into JSON that can be passed to the test runner."""

    serialized_mappings = {}
    referenced_files = []

    for target in dict:
        name = dict[target]

        if not DefaultInfo in target:
            fail("Expected %s mapping for %s to have the `DefaultInfo` provider." % (description, target))

        files = target[DefaultInfo].files.to_list()

        if len(files) != 1:
            fail("Expected %s target %s to only have a single file in `DefaultInfo`" % (description, target))

        serialized_mappings[name] = _serialize_file(files[0])
        referenced_files.append(files[0])

    return serialized_mappings, referenced_files

def _integration_test_config_impl(ctx):
    """Implementation of the `_integration_test_config` rule."""

    npmPackageMappings, npmPackageFiles = \
        _unwrap_label_keyed_mappings(ctx.attr.npm_packages, "NPM package")
    toolMappings, toolFiles = _unwrap_label_keyed_mappings(ctx.attr.tool_mappings, "Tool")

    config_file = ctx.actions.declare_file("%s.json" % ctx.attr.name)
    config = struct(
        testPackage = ctx.label.package,
        testFiles = [_serialize_file(f) for f in ctx.files.srcs],
        commands = [_split_and_expand_command(ctx, c) for c in ctx.attr.commands],
        npmPackageMappings = npmPackageMappings,
        toolMappings = toolMappings,
    )

    ctx.actions.write(
        output = config_file,
        content = json.encode(config),
    )

    runfiles = [config_file] + ctx.files.data + ctx.files.srcs + npmPackageFiles + toolFiles

    return [
        DefaultInfo(
            files = depset([config_file]),
            runfiles = ctx.runfiles(files = runfiles),
        ),
    ]

_integration_test_config = rule(
    implementation = _integration_test_config_impl,
    doc = """Rule which controls the integration test runner by writing a configuration file.""",
    attrs = {
        "srcs": attr.label_list(
            allow_files = True,
            mandatory = True,
            doc = "Files which need to be available when the integration test commands are invoked.",
        ),
        "data": attr.label_list(
            allow_files = True,
            doc = """
              Files which will be available for runfile resolution. Useful when location
              expansion is used in a command.""",
        ),
        "commands": attr.string_list(
            mandatory = True,
            doc = """
              List of commands to run as part of the integration test. The commands can rely on
              the global tools made available through the tool mappings.

              Commands can also use Bazel make location expansion.""",
        ),
        "npm_packages": attr.label_keyed_string_dict(
            allow_files = True,
            doc = """
              Dictionary of targets which map to NPM packages. This allows for NPM packages
              to be mapped to first-party built NPM artifacts.""",
        ),
        "tool_mappings": attr.label_keyed_string_dict(
            allow_files = True,
            doc = """
              Dictionary of targets which map to global tools needed by the integration test.
              This allows for binaries like `node` to be made available to the integration test
              using the `PATH` environment variable.""",
        ),
    },
)

def integration_test(
        name,
        srcs,
        commands,
        npm_packages = {},
        tool_mappings = {},
        data = [],
        tags = [],
        **kwargs):
    """Rule that allows for arbitrary commands to be executed within a temporary
      directory which will hold the specified test source files."""

    config_target = "%s_config" % name

    _integration_test_config(
        name = config_target,
        srcs = srcs,
        data = data,
        commands = commands,
        npm_packages = npm_packages,
        tool_mappings = tool_mappings,
        tags = tags,
    )

    nodejs_test(
        name = name,
        data = ["//bazel/integration/test_runner", ":" + config_target],
        templated_args = ["--bazel_patch_module_resolver", "$(rootpath :%s)" % config_target],
        entry_point = "//bazel/integration/test_runner:main.ts",
        tags = tags,
        **kwargs
    )
