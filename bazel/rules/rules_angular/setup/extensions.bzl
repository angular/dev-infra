load("//setup:repositories.bzl", "configurable_deps_repo")

def _extension(ctx):
    for mod in ctx.modules:
        for attr in mod.tags.setup:
            configurable_deps_repo(
                name = attr.name,
                angular_compiler_cli = attr.angular_compiler_cli,
                typescript = attr.typescript,
            )

rules_angular = module_extension(
    implementation = _extension,
    tag_classes = {
        "setup": tag_class(attrs = {
            "name": attr.string(default = "rules_angular_configurable_deps"),
            "angular_compiler_cli": attr.string(mandatory = True),
            "typescript": attr.string(mandatory = True),
        }),
    },
)
