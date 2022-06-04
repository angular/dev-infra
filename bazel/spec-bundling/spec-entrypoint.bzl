load("@rules_nodejs//nodejs:providers.bzl", "JSModuleInfo")

def _is_non_external_file_with_suffix(file, suffix):
    """Gets whether the given file is a non-external file with the given suffix."""
    basename = file.basename

    # External files (from other workspaces) are always skipped.
    if (file.short_path.startswith("../")):
        return False

    # `<suffix>.js` or `<suffix>.mjs` files will be imported in the entry-point.
    return basename.endswith("%s.js" % suffix) or \
           basename.endswith("%s.mjs" % suffix)

def _filter_files(files, suffix):
    """Filters the given list of files to only contain files with the given suffix."""
    result = []
    for file in files:
        if _is_non_external_file_with_suffix(file, suffix):
            result.append(file)
    return result

def _create_entrypoint_file(base_package, spec_files, bootstrap_files):
    """Creates the contents of the spec entry-point ESM file.

      The file will import all individual bootstrap and spec files so that
      these are bundled and loaded by NodeJS or the Karma browser."""

    output = ""
    for file in bootstrap_files + spec_files:
        base_dir_segments = "/".join([".."] * len(base_package.split("/")))
        output += """import "%s/%s";\n""" % (base_dir_segments, file.short_path)
    return output

def _spec_entrypoint_impl(ctx):
    output = ctx.actions.declare_file("%s.mjs" % ctx.attr.name)
    spec_depsets = []
    bootstrap_depsets = []

    for dep in ctx.attr.deps:
        if JSModuleInfo in dep:
            spec_depsets.append(dep[JSModuleInfo].sources)
        else:
            spec_depsets.append(dep[DefaultInfo].files)

    for dep in ctx.attr.bootstrap:
        if JSModuleInfo in dep:
            bootstrap_depsets.append(dep[JSModuleInfo].sources)
        else:
            bootstrap_depsets.append(dep[DefaultInfo].files)

    # Note: `to_list()` is an expensive operation but we need to do this for every
    # dependency here in order to be able to filter out spec files from depsets.
    all_spec_files = depset(transitive = spec_depsets).to_list()
    spec_files = _filter_files(all_spec_files, "spec")

    # Note: `to_list()` is an expensive operation but we need to do this for every
    # dependency here in order to be able to filter out spec files from depsets.
    all_bootstrap_files = depset(transitive = bootstrap_depsets).to_list()
    bootstrap_files = _filter_files(all_bootstrap_files, "init")

    ctx.actions.write(
        output = output,
        content = _create_entrypoint_file(ctx.label.package, spec_files, bootstrap_files),
    )

    out_depset = depset([output])

    return [
        DefaultInfo(files = out_depset),
        JSModuleInfo(
            direct_sources = out_depset,
            sources = depset(transitive = [out_depset] + spec_depsets + bootstrap_depsets),
        ),
    ]

spec_entrypoint = rule(
    implementation = _spec_entrypoint_impl,
    attrs = {
        "deps": attr.label_list(allow_files = False, mandatory = True),
        "bootstrap": attr.label_list(allow_files = False, mandatory = True),
    },
)
