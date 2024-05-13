load(
    "//bazel/esbuild:index.bzl",
    _esbuild = "esbuild",
    _esbuild_checked_in = "esbuild_checked_in",
    _esbuild_cjs_bundle = "esbuild_cjs_bundle",
    _esbuild_config = "esbuild_config",
    _esbuild_esm_bundle = "esbuild_esm_bundle",
)
load("//bazel:extract_js_module_output.bzl", "extract_js_module_output")

esbuild_config = _esbuild_config

def _esbuild_devmode_prioritize(
        esbuild_rule,
        name,
        testonly = False,
        platform = "node",
        target = "node14",
        deps = [],
        **kwargs):
    # TODO: Rename once devmode and prodmode have been combined.
    # This helps speeding up building as ESBuild (used internally by the rule) would
    # request both devmode and prodmode output flavor (resulting in 2x TS compilations).
    # Note: Devmode is equivalent to Prodmode and Prodmode breaks `.js` extensions.
    extract_js_module_output(
        name = "%s_devmode_deps" % name,
        deps = deps,
        testonly = testonly,
        provider = "JSModuleInfo",
        forward_linker_mappings = True,
        include_external_npm_packages = True,
        include_default_files = False,
        include_declarations = False,
    )

    esbuild_rule(
        name = name,
        platform = platform,
        target = target,
        testonly = testonly,
        deps = [":%s_devmode_deps" % name],
        **kwargs
    )

def esbuild(**kwargs):
    _esbuild_devmode_prioritize(
        _esbuild,
        **kwargs
    )

def esbuild_esm_bundle(**kwargs):
    _esbuild_devmode_prioritize(
        _esbuild_esm_bundle,
        **kwargs
    )

def esbuild_cjs_bundle(**kwargs):
    _esbuild_devmode_prioritize(
        _esbuild_cjs_bundle,
        **kwargs
    )

def esbuild_checked_in(name, **kwargs):
    _esbuild_checked_in(
        name,
        **kwargs
    )
