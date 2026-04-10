load("//setup:repositories.bzl", "configurable_deps_repo")

def _extension(ctx):
    root_setup = None
    generated = {}
    for mod in ctx.modules:
        if mod.is_root and mod.tags.setup:
            root_setup = mod.tags.setup[0]
        elif not root_setup and mod.tags.setup:
            root_setup = mod.tags.setup[0]

        for attr in mod.tags.setup:
            if attr.name in generated:
                fail("The repository '{}' is already registered by another module. Please use a different name.".format(attr.name))
            generated[attr.name] = True
            configurable_deps_repo(
                name = attr.name,
                angular_compiler_cli = attr.angular_compiler_cli,
                typescript = attr.typescript,
            )

    if "rules_angular_configurable_deps" not in generated:
        if root_setup:
            configurable_deps_repo(
                name = "rules_angular_configurable_deps",
                angular_compiler_cli = root_setup.angular_compiler_cli,
                typescript = root_setup.typescript,
            )

rules_angular = module_extension(
    implementation = _extension,
    tag_classes = {
        "setup": tag_class(attrs = {
            "name": attr.string(default = "rules_angular_configurable_deps"),
            "angular_compiler_cli": attr.label(mandatory = True),
            "typescript": attr.label(mandatory = True),
        }),
    },
)
