"""Implementation of browser_toolchain_alias."""

load(":named_files_info.bzl", "NamedFilesInfo")

def _browser_toolchain_alias_impl(ctx):
    template_variables = {}

    for dep in ctx.attr.deps:
        named_files = dep[NamedFilesInfo].value

        for key, value in named_files.items():
            template_variables[key] = value.short_path

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
