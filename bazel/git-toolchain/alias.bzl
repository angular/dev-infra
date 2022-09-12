def _git_toolchain_alias_impl(ctx):
    toolchain = ctx.toolchains["//bazel/git-toolchain:toolchain_type"]

    return [
        platform_common.TemplateVariableInfo({
            "GIT_BIN_PATH": toolchain.binary_path,
        }),
    ]

git_toolchain_alias = rule(
    implementation = _git_toolchain_alias_impl,
    toolchains = ["//bazel/git-toolchain:toolchain_type"],
    doc = """
      Exposes an alias for retrieving the resolved Git toolchain. Exposing a template variable for
      accessing the Git binary path using Bazel `Make variables`.
    """,
)
