load("//bazel/browsers:browser_configure.bzl", "NamedFilesInfo")

def _browser_toolchain_alias_impl(ctx):
    template_variables = {}

    for dep in ctx.attr.deps:
        base_path = dep.label.workspace_name
        named_files = dep[NamedFilesInfo].value

        for key, value in named_files.items():
            # We explicitly include the workspace name in the rootpath, so we need
            # follow the `../<workspace_name>/<path>` pattern. This matches what the
            # Bazel location expansion would generate for `$(rootpath <external_file>)`.
            # https://docs.bazel.build/versions/main/be/make-variables.html#predefined_label_variables.
            template_variables[key] = "../%s/%s" % (base_path, value)

    return [
        platform_common.TemplateVariableInfo(template_variables),
    ]

browser_toolchain_alias = rule(
    doc = """
      Exposes a toolchain alias exposing the template variables for all named files
      included in the browser metadata dependencies. The values of the template variables
      will follow the semantics of Bazel location rootpaths.

      The variables can be consumed within Bazel make variable expansion.
    """,
    implementation = _browser_toolchain_alias_impl,
    attrs = {
        "deps": attr.label_list(
            doc = """Metadata targets that provides the browser named files.""",
            mandatory = True,
            providers = [NamedFilesInfo, DefaultInfo],
        ),
    },
)
