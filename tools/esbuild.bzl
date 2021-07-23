load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")

"""Retrive the single javascript file from the esbuild output."""
def _get_single_file_impl(ctx):
    files = ctx.attr.dependency.files

    for f in files.to_list():
        if f.basename.endswith(".js"):
            return [
                DefaultInfo(files = depset([f])),
            ]

    fail('Unable to find the single js file created by "esbuild"')

"""Retrive the single javascript file from the esbuild output."""
_get_single_file = rule(
    attrs = {
        "dependency": attr.label(
            mandatory = True,
        ),
    },
    implementation = _get_single_file_impl,
)


"""
    Bundle script into single file using esbuild

    save_to_repo: Boolean, whether the bundled script should be saved locally to the repo.
"""
def esbuild(name, entry_point, save_to_repo = False, deps = []):
    _esbuild(
        name = "%s_esbuild" % name,
        entry_point = entry_point,
        deps = deps,
        platform = "node",
        target = "node12",
    )

    _get_single_file(
        name = name,
        dependency = ":%s_esbuild" % name,
    )

    if save_to_repo:
        generated_file_test(
            name = "generated_%s" % name,
            src = "%s.js" % name,
            generated = name,
        )
