load("@rules_nodejs//nodejs:providers.bzl", "JSModuleInfo")

def _is_spec_file(file):
    """Gets whether the given file is a spec file."""
    basename = file.basename

    # External files (from other workspaces) should never run as specs.
    if (file.short_path.startswith("../")):
        return False

    # `spec.js` or `spec.mjs` files will be imported in the entry-point.
    return basename.endswith("spec.js") or basename.endswith("spec.mjs")

def _filter_spec_files(files):
    """Filters the given list of files to only contain spec files."""
    result = []
    for file in files:
        if _is_spec_file(file):
            result.append(file)
    return result

def _create_entrypoint_file(base_package, spec_files):
    """Creates the contents of the spec entry-point ESM file which imports
    all individual spec files so that these are bundled and loaded by Node/Karma."""
    output = ""
    for file in spec_files:
        base_dir_segments = "/".join([".."] * len(base_package.split("/")))
        output += """import "%s/%s";\n""" % (base_dir_segments, file.short_path)
    return output

def _spec_entrypoint_impl(ctx):
    output = ctx.actions.declare_file("%s.mjs" % ctx.attr.name)
    spec_depsets = []

    for dep in ctx.attr.deps:
        if JSModuleInfo in dep:
            spec_depsets.append(dep[JSModuleInfo].sources)
        else:
            spec_depsets.append(dep[DefaultInfo].files)

    spec_files = []

    for spec_depset in spec_depsets:
        # Note: `to_list()` is an expensive operation but we need to do this for every
        # dependency here in order to be able to filter out spec files from depsets.
        spec_files.extend(_filter_spec_files(spec_depset.to_list()))

    ctx.actions.write(
        output = output,
        content = _create_entrypoint_file(ctx.label.package, spec_files),
    )

    out_depset = depset([output])

    return [
        DefaultInfo(files = out_depset),
        JSModuleInfo(
            direct_sources = out_depset,
            sources = depset(transitive = [out_depset] + spec_depsets),
        ),
    ]

spec_entrypoint = rule(
    implementation = _spec_entrypoint_impl,
    attrs = {
        "deps": attr.label_list(allow_files = False, mandatory = True),
    },
)
