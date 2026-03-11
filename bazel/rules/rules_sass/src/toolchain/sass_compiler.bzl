SassCompilerInfo = provider(
    doc = "Information about how to invoke the Sass compiler.",
    fields = ["binary"],
)

def _sass_compiler_impl(ctx):
    return [
        platform_common.ToolchainInfo(
            sass_compiler = SassCompilerInfo(
                binary = ctx.files.binary[0],
            ),
        ),
    ]

sass_compiler = rule(
    implementation = _sass_compiler_impl,
    attrs = {
        "binary": attr.label(
            allow_files = True,
            cfg = "exec",
        ),
    },
)
