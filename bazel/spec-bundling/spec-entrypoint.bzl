load("@aspect_rules_js//js:providers.bzl", "JsInfo", "js_info")
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

def _filter_files(files, filter_suffixes):
    """Filters the given list of files to only contain files with the given suffixes."""
    result = []
    for file in files:
        for suffix in filter_suffixes:
            if _is_non_external_file_with_suffix(file, suffix):
                result.append(file)
                break

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
    spec_all_deps = []
    bootstrap_direct_deps = []
    bootstrap_all_deps = []

    for dep in ctx.attr.deps:
        if JsInfo in dep:
            spec_all_deps.append(dep[JsInfo].transitive_sources)
            spec_all_deps.append(dep[JsInfo].npm_sources)
        elif JSModuleInfo in dep:
            spec_all_deps.append(dep[JSModuleInfo].sources)
        else:
            spec_all_deps.append(dep[DefaultInfo].files)

    for dep in ctx.attr.bootstrap:
        if JsInfo in dep:
            bootstrap_all_deps.append(dep[JsInfo].transitive_sources)
            bootstrap_all_deps.append(dep[JsInfo].npm_sources)
            bootstrap_direct_deps.append(dep[JsInfo].sources)
        elif JSModuleInfo in dep:
            bootstrap_all_deps.append(dep[JSModuleInfo].sources)
            bootstrap_direct_deps.append(dep[JSModuleInfo].direct_sources)
        else:
            bootstrap_all_deps.append(dep[DefaultInfo].files)
            bootstrap_direct_deps.append(dep[DefaultInfo].files)

    # Note: `to_list()` is an expensive operation but we need to do this for every
    # dependency here in order to be able to filter out spec files from depsets.
    all_spec_files = depset(transitive = spec_all_deps).to_list()
    spec_files = _filter_files(all_spec_files, ["spec", "test"])

    # Note: `to_list()` is an expensive operation but we need to do this for every
    # dependency here in order to be able to filter out spec files from depsets.
    direct_bootstrap_files = depset(transitive = bootstrap_direct_deps).to_list()

    # Filter to only js and mjs files, we can't always define what the name of the files
    # needed for bootstrapping are so we rely on the user to provide the exact list.
    bootstrap_files = _filter_files(direct_bootstrap_files, [""])

    ctx.actions.write(
        output = output,
        content = _create_entrypoint_file(ctx.label.package, spec_files, bootstrap_files),
    )

    out_depset = depset([output])
    transitive_deps = depset(transitive = [out_depset] + spec_all_deps + bootstrap_all_deps)

    return [
        DefaultInfo(files = out_depset),
        js_info(
            target = ctx.label,
            sources = out_depset,
            transitive_sources = transitive_deps,
        ),
        JSModuleInfo(
            direct_sources = out_depset,
            sources = transitive_deps,
        ),
    ]

spec_entrypoint = rule(
    implementation = _spec_entrypoint_impl,
    attrs = {
        "deps": attr.label_list(allow_files = True, mandatory = True),
        "bootstrap": attr.label_list(allow_files = True, mandatory = True),
    },
)
