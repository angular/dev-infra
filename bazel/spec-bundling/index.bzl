load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@aspect_rules_js//js:providers.bzl", "JsInfo")
load("@devinfra//bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")

# This rule filters out runfiles originating from `deps` and `srcs` to retain the same behavior
# as before https://github.com/aspect-build/rules_esbuild/commit/e088dc3cdb8d8877ce632f01121eadc8952a2999.
def _filter_runfiles_impl(ctx):
    bundle = ctx.attr.bundle
    files = bundle[DefaultInfo].files
    runfiles = ctx.runfiles(transitive_files = files)
    providers = [
        DefaultInfo(
            files = files,
            runfiles = runfiles,
        ),
    ]
    if JsInfo in bundle:
        providers.append(bundle[JsInfo])
    return providers

_filter_runfiles = rule(
    implementation = _filter_runfiles_impl,
    attrs = {
        "bundle": attr.label(mandatory = True),
    },
)

def spec_bundle(name, deps, srcs = [], bootstrap = [], testonly = True, config = {}, **kwargs):
    """Bundles spec files and their dependencies into a single spec bundle using esbuild.

    Args:
        name: Name of the bundle target.
        deps: Dependencies containing spec files and sources.
        srcs: Additional source files.
        bootstrap: Bootstrap files to load before the specs.
        testonly: Whether the target is testonly.
        config: Additional esbuild configuration options.
        **kwargs: Additional attributes to pass to esbuild.
    """
    spec_entrypoint(
        name = "%s_entrypoint" % name,
        deps = deps,
        bootstrap = bootstrap,
        testonly = testonly,
    )

    visibility = kwargs.pop("visibility", None)
    tags = kwargs.pop("tags", None)
    esbuild_name = "_%s_bundle" % name

    esbuild(
        name = esbuild_name,
        # Note: `deps` are added here to automatically collect transitive NPM
        # sources etc. and make them available for bundling.
        srcs = srcs + deps + [
            ":%s_entrypoint" % name,
        ],
        config = dict({
            # Bundling specs may result in classes being aliased to avoid collisions. e.g. when
            # everything is bundled into a single AMD bundle. To avoid test failures for assertions
            # on symbol names, we instruct ESBuild to keep original names. See:
            # https://esbuild.github.io/api/#keep-names.
            "keepNames": True,
            # Needed for ZoneJS async await
            "supported": {
                "async-await": False,
            },
        }, **config),
        testonly = testonly,
        bundle = True,
        format = "iife",
        sourcemap = "linked",
        platform = kwargs.pop("platform", "node"),
        entry_point = ":%s_entrypoint" % name,
        output = "%s.spec.js" % name,
        visibility = ["//visibility:private"],
        **kwargs
    )

    _filter_runfiles(
        name = name,
        bundle = ":%s" % esbuild_name,
        testonly = testonly,
        visibility = visibility,
        tags = tags,
    )
