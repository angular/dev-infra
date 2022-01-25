load("@build_bazel_rules_nodejs//:providers.bzl", "JSNamedModuleInfo")

def _get_workspace_name(ctx):
    if ctx.label.workspace_root:
        # We need the workspace_name for the target being visited.
        # Starlark doesn't have this - instead they have a workspace_root
        # which looks like "external/repo_name" - so grab the second path segment.
        return ctx.label.workspace_root.split("/")[1]
    else:
        return ctx.workspace_name

def _http_server_rule_impl(ctx):
    """Implementation of the http server rule."""

    workspace_name = _get_workspace_name(ctx)
    package_manifest_path = "%s/%s" % (workspace_name, ctx.label.package)

    # List of files which are required for the server to run. This includes the
    # bazel runfile helpers (to resolve runfiles in bash) and the server binary
    # with its transitive runfiles (in order to be able to run the server).
    required_tools = ctx.files._bash_runfile_helpers + \
                     ctx.files._server_bin + \
                     ctx.attr._server_bin[DefaultInfo].files.to_list() + \
                     ctx.attr._server_bin[DefaultInfo].data_runfiles.files.to_list()

    # Walk through all dependencies specified in the "deps" attribute. These labels need to be
    # unwrapped in case there are built using TypeScript-specific rules.
    transitive_depsets = []
    for dep in ctx.attr.deps:
        if JSNamedModuleInfo in dep:
            transitive_depsets.append(dep[JSNamedModuleInfo].sources)
        elif DefaultInfo in dep:
            transitive_depsets.append(dep[DefaultInfo].files)

    root_paths = ["", package_manifest_path] + ctx.attr.additional_root_paths

    # We can't use "ctx.actions.args()" because there is no way to convert the args object
    # into a string representing the command line arguments. It looks like bazel has some
    # internal logic to compute the string representation of "ctx.actions.args()".
    args = ""

    for root in root_paths:
        args += "--root-paths '%s' " % root

    if ctx.attr.history_api_fallback:
        args += "--history-api-fallback=true "

    if ctx.attr.enable_dev_ui:
        args += "--enable-dev-ui=true "

    for variable_name in ctx.attr.environment_variables:
        args += "--environment-variables '%s' " % variable_name

    ctx.actions.expand_template(
        template = ctx.file._launcher_template,
        output = ctx.outputs.launcher,
        substitutions = {
            "TEMPLATED_args": args,
        },
        is_executable = True,
    )

    runfiles = ctx.runfiles(
        files = ctx.files.srcs + required_tools,
        transitive_files = depset(transitive = transitive_depsets),
        collect_data = True,
        collect_default = True,
    )

    return [
        DefaultInfo(
            files = depset([ctx.outputs.launcher]),
            runfiles = runfiles,
        ),
    ]

http_server_rule = rule(
    implementation = _http_server_rule_impl,
    outputs = {
        "launcher": "%{name}.sh",
    },
    attrs = {
        "additional_root_paths": attr.string_list(
            doc = """
              Additional paths to serve files from. The paths should be passed
              as manifest paths (e.g. "my_workspace/src").
              """,
        ),
        "deps": attr.label_list(
            allow_files = True,
            doc = """
              Dependencies that need to be available for resolution. This attribute can be
              used for TypeScript targets which provide multiple flavors of output.
            """,
        ),
        "enable_dev_ui": attr.bool(
            default = False,
            doc = """
              Whether an additional UI for development should be enabled. 
              The development UI can be helpful for throttling network and more. This
              is a feature from the underlying browsersync implementation.
            """,
        ),
        "history_api_fallback": attr.bool(
            default = True,
            doc = """
              Whether the server should fallback to "/index.html" for non-file requests.
              This is helpful for single page applications using the HTML history API.
            """,
        ),
        "environment_variables": attr.string_list(
            default = [],
            doc = """
              List of environment variables that will be made available in the `index.html` 
              file. Variables can be accessed through `window.<NAME>`.

              This is useful as an example when developers want to have an API key available
              as part of their development workflow, but not hard-coding it into the sources.
            """,
        ),
        "srcs": attr.label_list(
            allow_files = True,
            doc = """
              Sources that should be available to the server for resolution. This attribute can
              be used for explicit files. This attribute only uses the files exposed by the
              `DefaultInfo` provider (i.e. TypeScript targets should be added to "deps").
            """,
        ),
        "_bash_runfile_helpers": attr.label(default = Label("@bazel_tools//tools/bash/runfiles")),
        "_server_bin": attr.label(
            default = Label("//bazel/http-server:server_bin"),
        ),
        "_launcher_template": attr.label(
            allow_single_file = True,
            default = Label("//bazel/http-server:launcher_template.sh"),
        ),
    },
)

def http_server(name, testonly = False, port = 4200, tags = [], **kwargs):
    """Creates an HTTP server that can depend on individual bazel targets. The server uses
      bazel runfile resolution in order to work with Bazel package paths. e.g. developers can
      request files through their manifest path: "my_workspace/src/dev-app/my-genfile"."""

    http_server_rule(
        name = "%s_launcher" % name,
        visibility = ["//visibility:private"],
        tags = tags,
        testonly = testonly,
        **kwargs
    )

    native.sh_binary(
        name = name,
        # The "ibazel_notify_changes" tag tells ibazel to not relaunch the executable on file
        # changes. Rather it will communicate with the server implementation through "stdin".
        tags = tags + ["ibazel_notify_changes"],
        srcs = ["%s_launcher.sh" % name],
        data = [":%s_launcher" % name],
        args = ["--port=%s" % port],
        testonly = testonly,
    )
