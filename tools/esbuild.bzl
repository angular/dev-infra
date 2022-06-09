load("//bazel/esbuild:index.bzl", _esbuild = "esbuild", _esbuild_config = "esbuild_config")
load("//bazel:extract_js_module_output.bzl", "extract_js_module_output")
load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test")

esbuild_config = _esbuild_config

def esbuild(name, platform = "node", target = "node14", deps = [], **kwargs):
    # TODO: Rename once devmode and prodmode have been combined.
    # This helps speeding up building as ESBuild (used internally by the rule) would
    # request both devmode and prodmode output flavor (resulting in 2x TS compilations).
    # Note: Devmode is equivalent to Prodmode and Prodmode breaks `.js` extensions.
    extract_js_module_output(
        name = "%s_devmode_deps" % name,
        deps = deps,
        provider = "JSModuleInfo",
        forward_linker_mappings = True,
        include_external_npm_packages = True,
        include_default_files = False,
        include_declarations = False,
    )

    _esbuild(
        name = name,
        platform = platform,
        target = target,
        deps = [":%s_devmode_deps" % name],
        **kwargs
    )

def esbuild_esm_bundle(name, **kwargs):
    """ESBuild macro that prioritizes ESM output and supports an ESM/CJS interop.

    Args:
      name: Name of the target
      deps: List of dependencies
      **kwargs: Other arguments passed to the `esbuild` rule.
    """

    args = dict(
        resolveExtensions = [".mjs", ".js"],
        outExtension = {".js": ".mjs"},
        # Workaround for: https://github.com/evanw/esbuild/issues/1921.
        banner = {
            "js": """
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);
""",
        },
    )

    esbuild(
        name = name,
        format = "esm",
        args = args,
        **kwargs
    )

def esbuild_checked_in(name, **kwargs):
    esbuild_esm_bundle(
        name = "%s_generated" % name,
        # Unfortunately we need to omit source maps from the checked-in files as these
        # will vary based on the platform. See more details below in the sanitization
        # genrule transformation. It is acceptable not having source-maps for the checked-in
        # files as those are not minified and its to debug, the checked-in file can be visited.
        sourcemap = "external",
        # We always disable minification for checked-in files as otherwise it will
        # become difficult determining potential differences. e.g. on Windows ESBuild
        # accidentally included `source-map-support` due to the missing sandbox.
        minify = False,
        **kwargs
    )

    # ESBuild adds comments and function identifiers with the name of their module
    # location. e.g. `"bazel-out/x64_windows-fastbuild/bin/node_modules/a"function(exports)`.
    # We strip all of these paths as that would break approval of the he checked-in files within
    # different platforms (e.g. RBE running with K8). Additionally these paths depend
    # on the non-deterministic hoisting of the package manager across all platforms.
    native.genrule(
        name = "%s_sanitized" % name,
        srcs = ["%s_generated.js" % name],
        outs = ["%s_sanitized.js" % name],
        cmd = """cat $< | sed -E "s#(bazel-out|node_modules)/[^\\"']+##g" > $@""",
    )

    generated_file_test(
        name = name,
        src = "%s.js" % name,
        generated = "%s_sanitized.js" % name,
    )
