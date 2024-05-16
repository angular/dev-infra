def _git_toolchain_impl(ctx):
    return [
        platform_common.ToolchainInfo(
            binary_path = ctx.attr.binary_path,
        ),
    ]

git_toolchain = rule(
    implementation = _git_toolchain_impl,
    attrs = {
        "binary_path": attr.string(doc = "System path to the Git binary"),
    },
    doc = "Toolchain for configuring Git for a specific platform.",
)
