load("@npm//@bazel/esbuild:index.bzl", _esbuild = "esbuild", _esbuild_config = "esbuild_config")
load("//bazel:expand_template.bzl", "expand_template")

# Re-export of the actual esbuild definitions.
esbuild_config = _esbuild_config

def esbuild(
        name,
        # Inline source contents to make debugging easier. Contents are inlined by default
        # in ESBuild but `@bazel/esbuild` sets the default to `false`. Inlining sources is
        # helpful as otherwise developers would need to manually wire up the Bazel execroot
        # as workspace in the Chrome devtools.
        # https://github.com/bazelbuild/rules_nodejs/blob/c30a26c13d20dac48dc9f220370cb02a317b13f3/packages/esbuild/esbuild.bzl#L333.
        sources_content = True,
        # Never build a metadata file by default. It's not needed in most use-cases.
        metafile = False,
        **kwargs):
    _esbuild(
        name = name,
        sources_content = sources_content,
        metafile = metafile,
        **kwargs
    )

def esbuild_esm_bundle(name, define = {}, **kwargs):
    """ESBuild macro supports an ESM/CJS interop.

    Args:
      name: Name of the target
      **kwargs: Other arguments passed to the `esbuild` rule.
    """

    args = dict(
        resolveExtensions = [".mjs", ".js", ".json"],
        outExtension = {".js": ".mjs"},
        # Workaround for: https://github.com/evanw/esbuild/issues/1921.
        banner = {
            "js": """
import {createRequire as __cjsCompatRequire} from 'module';
const require = __cjsCompatRequire(import.meta.url);
""",
        },
        define = define,
    )

    esbuild(
        name = name,
        format = "esm",
        args = args,
        **kwargs
    )

def esbuild_cjs_bundle(name, **kwargs):
    """ESBuild macro supports an ESM/CJS interop.

    Args:
      name: Name of the target
      **kwargs: Other arguments passed to the `esbuild` rule.
    """

    args = dict(
        resolveExtensions = [".cjs", ".js", ".json"],
        outExtension = {".js": ".cjs"},
    )

    esbuild(
        name = name,
        format = "cjs",
        args = args,
        **kwargs
    )

def esbuild_amd(name, entry_point, module_name, testonly = False, config = None, deps = [], **kwargs):
    """Generates an AMD bundle for the specified entry-point with the given AMD module name."""
    expand_template(
        name = "%s_config" % name,
        testonly = testonly,
        template = "//bazel/esbuild:esbuild-amd-config.mjs",
        output_name = "%s_config.mjs" % name,
        substitutions = {
            "TMPL_MODULE_NAME": module_name,
            "TMPL_CONFIG_PATH": "$(execpath %s)" % config if config else "",
        },
        data = [config] if config else None,
    )

    _esbuild_config(
        name = "%s_config_lib" % name,
        testonly = testonly,
        config_file = "%s_config" % name,
        # Adds the user configuration and its deps as dependency of the AMD ESBuild config.
        # https://github.com/bazelbuild/rules_nodejs/blob/a892caf5a040bae5eeec174a3cf6250f02caf364/packages/esbuild/esbuild_config.bzl#L23.
        deps = [config, "%s_deps" % config] if config else None,
    )

    esbuild(
        name = name,
        testonly = testonly,
        deps = deps,
        entry_point = entry_point,
        format = "iife",
        config = "%s_config_lib" % name,
        **kwargs
    )
