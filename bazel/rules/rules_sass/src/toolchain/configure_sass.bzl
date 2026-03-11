def _configure_sass_impl(rctx):
    rctx.file(
        "BUILD.bazel",
        content = """
load("@rules_sass//src/toolchain:sass_compiler.bzl", "sass_compiler")

package(default_visibility = ["//visibility:public"])

sass_compiler(
    name = "binary",
    binary = "{compiler_file}",
)

toolchain(
    name = "toolchain",
    exec_compatible_with = {compatible_with},
    target_compatible_with = {compatible_with},
    toolchain = ":binary",
    toolchain_type = "@rules_sass//src/toolchain:toolchain_type",
)
""".format(
            compiler_file = rctx.attr.file,
            compatible_with = ["@%s//%s:%s" % (c.workspace_name, c.package, c.name) for c in rctx.attr.constraints],
        ),
    )

configure_sass = repository_rule(
    implementation = _configure_sass_impl,
    attrs = {
        "file": attr.string(mandatory = True),
        "sha256": attr.string(mandatory = True),
        "constraints": attr.label_list(mandatory = True),
    },
)
