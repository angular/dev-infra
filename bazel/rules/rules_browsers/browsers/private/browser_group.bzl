"""Implementation of browser_group."""

load(":named_files_info.bzl", "NamedFilesInfo")

def _browser_group_impl(ctx):
    named_files = {}
    runfiles = []

    for dep in ctx.attr.deps:
        runfiles.append(dep[DefaultInfo].default_runfiles)

        for key, value in dep[NamedFilesInfo].value.items():
            named_files[key] = value

    return [
        DefaultInfo(runfiles = ctx.runfiles().merge_all(runfiles)),
        NamedFilesInfo(value = named_files),
    ]

browser_group = rule(
    implementation = _browser_group_impl,
    doc = "Groups multiple `browser_artifact` into a single target",
    attrs = {
        "deps": attr.label_list(mandatory = True),
    },
)
