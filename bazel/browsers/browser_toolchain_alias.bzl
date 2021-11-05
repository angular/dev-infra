load("//bazel/browsers:browser_configure.bzl", "NamedFilesInfo")

def _browser_toolchain_alias_impl(ctx):
    base_path = ctx.attr.metadata.label.workspace_name
    named_files = ctx.attr.metadata[NamedFilesInfo].value
    template_variables = {}

    for key, value in named_files.items():
        template_variables[key] = "external/%s/%s" % (base_path, value)

    return [
        platform_common.TemplateVariableInfo(template_variables),
    ]

browser_toolchain_alias = rule(
    doc = """
      Exposes a toolchain alias exposing the template variables for all named files
      included in the browser metadata. These variables can then be consumed within Bazel
      make variable expansion.
    """,
    implementation = _browser_toolchain_alias_impl,
    attrs = {
        "metadata": attr.label(
            doc = """Metadata target that provides the browser named files.""",
            mandatory = True,
            providers = [NamedFilesInfo, DefaultInfo],
        ),
    },
)
