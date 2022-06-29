load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_test")

def _serialize_file(file):
    """Serializes a file into a struct that matches the `BazelFileInfo` type in the
      packager implementation. Useful for transmission of such information."""

    return struct(path = file.path, shortPath = file.short_path)

def _create_expanded_value(value, isExpanded):
    """Creates a JSON serializable dictionary matching the `BazelExpandedValue` type in
      the test runner."""
    return {
        "value": value,
        "containsExpansion": isExpanded,
    }

def _serialize_and_expand_value(ctx, value, description):
    """Expands Bazel make variable and location expressions for the given value. Returns a JSON
      serializable dictionary matching the `BazelExpandedValue` type in the test runner."""
    expanded_location_value = ctx.expand_location(value, targets = ctx.attr.data)

    # Note: `expand_make_variables` is deprecated but there is no reasonable replacement
    # yet. It's also still discussed whether the deprecation was reasonable to begin with:
    # https://github.com/bazelbuild/bazel/issues/5859. If this ever gets deleted, we can
    # directly use `ctx.var` but would have switch users from e.g. `$(VAR)` to `{VAR}`.
    expanded_make_value = ctx.expand_make_variables(description, expanded_location_value, {})

    return _create_expanded_value(expanded_make_value, expanded_make_value != value)

def _expand_and_split_command(ctx, command):
    """Expands a command using the Bazel command helper. The command is then split into the
      binary and its arguments, matching the runner `[BazelExpandedValue, ...string[]]` type."""

    # Instead of manually resolving the command using e.g. `ctx.expand_location`, we use
    # the Bazel `resolve_command` helper which internally follows the semantics of a `genrule`,
    # allowing for better expansion/resolution of tools provided in the `data` attribute.
    # This is necessary so that e.g. executables from a `sh_binary` can be conveniently
    # expanded through `$(rootpath <label>`). Note that the same would not work with
    # `ctx.expand_location` as a `sh_binary` exposes multiple files causing an error like:
    #  -->  `expression expands to more than one file, please use $(locations ...)`.
    # The Bazel command helper utility instead (which is also used by the genrule internally),
    # will be able to determine the executable (based on the current exec platform) and expand it.
    # https://cs.opensource.google/bazel/bazel/+/master:src/main/java/com/google/devtools/build/lib/analysis/CommandHelper.java;l=175-199;drc=2255ce4165f936f695111020fa664b259a875c4a.
    inputs, resolved_bash_command, manifests = ctx.resolve_command(
        command = command,
        attribute = "command (%s)" % command,
        expand_locations = True,
        make_variables = ctx.var,
        tools = ctx.attr.data,
    )

    # If the resolved command does not have three arguments, then there were too many arguments
    # and Bazel extracted the command into a dedicated Bash script that we cannot read here.
    # https://cs.opensource.google/bazel/bazel/+/master:src/main/java/com/google/devtools/build/lib/analysis/BashCommandConstructor.java;l=40;drc=2255ce4165f936f695111020fa664b259a875c4a.
    # https://cs.opensource.google/bazel/bazel/+/master:src/main/java/com/google/devtools/build/lib/analysis/CommandHelper.java;l=275-282;drc=2255ce4165f936f695111020fa664b259a875c4a.
    if len(resolved_bash_command) != 3:
        fail("Test command too long. Please use a shorter one, or extract this " +
             "into a dedicated script: %s" % command)

    # The third argument of the resolved `bash -c` command will hold the actually expanded command.
    # We extract the command since we were only interested in the proper expansion of tools.
    # https://cs.opensource.google/bazel/bazel/+/master:src/main/java/com/google/devtools/build/lib/analysis/BashCommandConstructor.java;l=40;drc=2255ce4165f936f695111020fa664b259a875c4a.
    resolved_command = resolved_bash_command[2].split(" ")
    resolved_binary = resolved_command[0]
    original_binary = command.split(" ", 1)[0]

    # If the resolved command binary does not match the binary from the original command, then
    # we know a Make expression has been expanded and we capture that in a `BazelExpandedValue`.
    if resolved_binary != original_binary:
        return [_create_expanded_value(resolved_binary, True)] + resolved_command[1:]

    return [_create_expanded_value(resolved_binary, False)] + resolved_command[1:]

def _serialize_and_expand_environment(ctx, environment_dict):
    """Converts the given environment dictionary into a JSON-serializable dictionary
      that will work with the test runner."""
    result = {}

    for variable_name in environment_dict:
        value = environment_dict[variable_name]
        result[variable_name] = _serialize_and_expand_value(ctx, value, "environment")

    return result

def _unwrap_label_keyed_mappings(ctx, dict, description):
    """Unwraps a label-keyed dictionary used for expressing mappings into a JSON-serializable
    dictionary that will match the `Record<string, BazelFileInfo>` type as in the test
    runner. Additionally, the list of referenced mapping files is returned so that these
    can be added to the runfiles of the tool relying on the serialized mappings.

    This helper is used for serializing the `npm_packages` and `tool_mappings`
    dictionaries into JSON that can be passed to the test runner."""

    serialized_mappings = {}
    static_runfiles = []
    transitive_runfiles = []

    for target in dict:
        name = dict[target]

        if not DefaultInfo in target:
            fail("Expected %s mapping for %s to have the `DefaultInfo` provider." % (description, target))

        info = target[DefaultInfo]

        # If this target is an executable, we can just take the executable and the target
        # default runfiles. This allows e.g. for simple mappings to `nodejs_binary`
        if info.files_to_run and info.files_to_run.executable:
            transitive_runfiles.append(info.default_runfiles)
            serialized_mappings[name] = _serialize_file(info.files_to_run.executable)
            continue

        # In the other case, for convenience, we allow non-executable targets to become
        # executables (for e.g. tool mappings) if they have a single file in `DefaultInfo`.
        files = info.files.to_list()

        if len(files) != 1:
            fail("Expected %s target %s to be an executable, or to be a " % (description, target) +
                 "target with only a single file in `DefaultInfo`")

        static_runfiles.append(files[0])
        serialized_mappings[name] = _serialize_file(files[0])

    # Runfiles object containing all files to support the executable mappings.
    required_runfiles = ctx.runfiles(files = static_runfiles).merge_all(transitive_runfiles)

    return serialized_mappings, required_runfiles

def _integration_test_config_impl(ctx):
    """Implementation of the `_integration_test_config` rule."""
    npmPackageMappings, npmPackageRunfiles = \
        _unwrap_label_keyed_mappings(ctx, ctx.attr.npm_packages, "NPM package")
    toolMappings, toolRunfiles = \
        _unwrap_label_keyed_mappings(ctx, ctx.attr.tool_mappings, "Tool")

    config_file = ctx.actions.declare_file("%s.json" % ctx.attr.name)
    config = struct(
        testPackage = ctx.label.package,
        testPackageRelativeWorkingDir = ctx.attr.working_dir,
        testFiles = [_serialize_file(f) for f in ctx.files.srcs],
        commands = [_expand_and_split_command(ctx, c) for c in ctx.attr.commands],
        environment = _serialize_and_expand_environment(ctx, ctx.attr.environment),
        npmPackageMappings = npmPackageMappings,
        toolMappings = toolMappings,
    )

    ctx.actions.write(
        output = config_file,
        content = json.encode(config),
    )

    runfiles = ctx.runfiles(
        [config_file] + ctx.files.data + ctx.files.srcs,
    )

    # Include transitive runfiles for `data` dependencies. Also include runfiles
    # for the configured tool mappings or npm packages. Note that using `merge_all`
    # is more efficient than calling it multiple times, building a deep chain.
    runfiles = runfiles.merge_all(
        [toolRunfiles, npmPackageRunfiles] +
        [data_dep[DefaultInfo].default_runfiles for data_dep in ctx.attr.data],
    )

    return [
        DefaultInfo(
            files = depset([config_file]),
            runfiles = runfiles,
        ),
    ]

_integration_test_config = rule(
    implementation = _integration_test_config_impl,
    doc = """Rule which controls the integration test runner by writing a configuration file.""",
    attrs = {
        "working_dir": attr.string(
            default = "",
            doc = """
              Relative path that points to the working directory in which the integration
              test commands are executed.

              The working directory is also used as base directory for finding a `package.json`
              file that will be updated to reflect the integration test NPM package mappings.
            """,
        ),
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

              Commands can also use Bazel make configuration variable or location expansion.""",
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
        "environment": attr.string_dict(
            doc = """
              Dictionary of environment variables and their values. This allows for custom
              environment variables to be set when integration commands are invoked.

              The environment variable values can use Bazel make variable or location expansion,
              similar to the `commands` attribute. Additionally, values of `<TMP>` are replaced
              with a unique temporary directory. This can be useful when providing `HOME` for
              bazelisk or puppeteer as as an example.
            """,
        ),
    },
)

def integration_test(
        name,
        srcs,
        commands,
        npm_packages = {},
        tool_mappings = {},
        environment = {},
        toolchains = [],
        working_dir = None,
        data = [],
        tags = [],
        **kwargs):
    """Rule that allows for arbitrary commands to be executed within a temporary
      directory which will hold the specified test source files."""

    config_target = "%s_config" % name

    _integration_test_config(
        name = config_target,
        testonly = True,
        srcs = srcs,
        data = data,
        commands = commands,
        npm_packages = npm_packages,
        tool_mappings = tool_mappings,
        environment = environment,
        working_dir = working_dir,
        tags = tags,
        toolchains = toolchains,
    )

    nodejs_test(
        name = name,
        data = ["//bazel/integration/test_runner", ":" + config_target],
        templated_args = ["--nobazel_run_linker", "$(rootpath :%s)" % config_target],
        entry_point = "//bazel/integration/test_runner:main.ts",
        tags = tags,
        **kwargs
    )
