load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo", "ExternalNpmPackageInfo", "JSEcmaScriptModuleInfo", "JSModuleInfo", "JSNamedModuleInfo", "node_modules_aspect")
load("@build_bazel_rules_nodejs//internal/linker:link_node_modules.bzl", "LinkerPackageMappingInfo", "module_mappings_aspect")

"""Converts a provider name to its actually Starlark provider instance."""

def _name_to_js_module_provider(name):
    if name == "JSModuleInfo":
        return JSModuleInfo
    elif name == "JSNamedModuleInfo":
        return JSNamedModuleInfo
    elif name == "JSEcmaScriptModuleInfo":
        return JSEcmaScriptModuleInfo
    fail("Unexpected JavaScript module provider.")

"""Implementation of the extract_js_module_output rule."""

def _extract_js_module_output_impl(ctx):
    js_module_provider = _name_to_js_module_provider(ctx.attr.provider)
    mappings = {}
    depsets = []

    for dep in ctx.attr.deps:
        # Include JavaScript sources (including transitive outputs) based on the
        # configured JavaScript module provider.
        if js_module_provider in dep:
            depsets.append(dep[js_module_provider].sources)

        # If external NPM package sources should be included, we also capture the
        # sources (including transitive external NPM packages).
        if ctx.attr.include_external_npm_packages and ExternalNpmPackageInfo in dep:
            depsets.append(dep[ExternalNpmPackageInfo].sources)

        # If we intend to forward linker mappings, capture first-party package
        # linker mappings and collect them in a dictionary that we will re-expose.
        if ctx.attr.forward_linker_mappings and LinkerPackageMappingInfo in dep:
            mappings.update(dep[LinkerPackageMappingInfo].mappings)

        # Based on whether declarations should be collected, extract direct
        # and transitive declaration files using the `DeclarationInfo` provider.
        if ctx.attr.include_declarations and DeclarationInfo in dep:
            depsets.append(dep[DeclarationInfo].transitive_declarations)

        # Based on whether default files should be collected, extract direct
        # files which are exposed using the `DefaultInfo` provider. Also include
        # data runfiles which are needed for the current target.
        # https://docs.bazel.build/versions/main/skylark/lib/DefaultInfo.html#data_runfiles
        if ctx.attr.include_default_files and DefaultInfo in dep:
            depsets.append(dep[DefaultInfo].files)
            depsets.append(dep[DefaultInfo].data_runfiles.files)

    sources = depset(transitive = depsets)

    return [
        DefaultInfo(files = sources),
        LinkerPackageMappingInfo(mappings = mappings),
    ]

"""
  Rule that collects declared JavaScript module output files from a list of dependencies
  based on a configurable JavaScript module provider. The extracted outputs are exposed
  within the `DefaultInfo` provider. Targets defined using this rule can be used as input
  for rules that require JavaScript sources, or if there are multiple JavaScript output
  variants defined for a target while for example only the `JSModule` outputs are of interest.

  As an example: This rule is helpful in combination with `ts_library` and `ng_module` as
  those rule expose multiple output flavors (which are distinguishable by the JavaScript module
  providers as imported from `providers.bzl`). i.e. these rules expose flavors for named AMD
  modules and ECMAScript module output. For reference:
  https://github.com/bazelbuild/rules_nodejs/blob/stable/packages/typescript/internal/build_defs.bzl#L334-L337
"""
extract_js_module_output = rule(
    implementation = _extract_js_module_output_impl,
    attrs = {
        "deps": attr.label_list(
            allow_files = True,
            aspects = [module_mappings_aspect, node_modules_aspect],
        ),
        "provider": attr.string(
            doc = "JavaScript module info provider that is used for collecting sources from the dependencies.",
            mandatory = True,
            values = ["JSModuleInfo", "JSNamedModuleInfo", "JSEcmaScriptModuleInfo"],
        ),
        "forward_linker_mappings": attr.bool(
            mandatory = True,
            doc = """
              Whether linker mappings of the dependencies should be forwarded.

              This can be useful when the sources are put into JavaScript consuming rules
              where module mappings are relevant. e.g. when passed as `deps` to `esbuild`.
            """,
        ),
        "include_external_npm_packages": attr.bool(
            mandatory = True,
            doc = """
              Whether external NPM package sources should be extracted as well.

              NPM packages can contain arbitrary sources that would be included. e.g. a
              package could also contain `.json` files that would be extracted here. Also
              note that there is no separation of the JS-based providers for external packages,
            """,
        ),
        "include_declarations": attr.bool(
            mandatory = True,
            doc = "Whether declaration files should be collected from the dependencies.",
        ),
        "include_default_files": attr.bool(
            mandatory = True,
            doc = """
              Whether files from the `DefaultInfo` provider should be collected. Includes
              data runfiles needed for the default outputs from dependencies.
            """,
        ),
    },
)
