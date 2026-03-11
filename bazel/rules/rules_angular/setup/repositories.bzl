def _configurable_deps_impl(rctx):
    rctx.file(
        "BUILD.bazel",
        content = """
alias(
    name = "angular_compiler_cli",
    actual = "{angular_compiler_cli}",
    visibility = ["//visibility:public"],
)

alias(
    name = "typescript",
    actual = "{typescript}",
    visibility = ["//visibility:public"],
)
""".format(
            angular_compiler_cli = rctx.attr.angular_compiler_cli,
            typescript = rctx.attr.typescript,
        ),
    )

configurable_deps_repo = repository_rule(
    implementation = _configurable_deps_impl,
    attrs = {
        "angular_compiler_cli": attr.label(
            mandatory = True,
            doc = "Label pointing to the `@angular/compiler-cli` package.",
        ),
        "typescript": attr.label(
            mandatory = True,
            doc = "Label pointing to the `typescript` package.",
        ),
    },
)
