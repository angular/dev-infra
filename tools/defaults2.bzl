load("@aspect_bazel_lib//lib:copy_to_bin.bzl", _copy_to_bin = "copy_to_bin")
load("@aspect_bazel_lib//lib:write_source_files.bzl", _write_source_file = "write_source_file")
load("@aspect_rules_esbuild//esbuild:defs.bzl", _esbuild = "esbuild")
load("@aspect_rules_jasmine//jasmine:defs.bzl", _jasmine_test = "jasmine_test")
load("@aspect_rules_js//js:defs.bzl", _js_binary = "js_binary")
load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("@aspect_rules_ts//ts:defs.bzl", _ts_config = "ts_config")
load("@rules_angular//src/ng_package/text_replace:index.bzl", _text_replace = "text_replace")
load("@rules_angular//src/ng_project:index.bzl", _ng_project = "ng_project")
load("//bazel:extract_types.bzl", _extract_types = "extract_types")
load("//tools:ts_project_interop.bzl", _ts_project = "ts_project")

copy_to_bin = _copy_to_bin
ts_config = _ts_config
js_binary = _js_binary
esbuild = _esbuild
extract_types = _extract_types

def _determine_tsconfig(testonly):
    if native.package_name().startswith("ng-dev"):
        return "//ng-dev:tsconfig_test" if testonly else "//ng-dev:tsconfig"

def ts_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def ng_project(
        name,
        source_map = True,
        testonly = False,
        tsconfig = None,
        **kwargs):
    if tsconfig == None:
        tsconfig = _determine_tsconfig(testonly)

    _ts_project(
        name,
        source_map = source_map,
        rule_impl = _ng_project,
        testonly = testonly,
        tsconfig = tsconfig,
        **kwargs
    )

def npm_package(name, srcs = [], substitutions = {}, **kwargs):
    _text_replace(
        name = "%s_substituted" % name,
        srcs = srcs,
        substitutions = substitutions,
    )
    _npm_package(
        name = name,
        srcs = srcs + [
            "%s_substituted" % name,
        ],
        replace_prefixes = {
            "%s_substituted" % name: "/",
        },
        allow_overwrites = True,
        **kwargs
    )

def jasmine_test(name, **kwargs):
    _jasmine_test(
        name = name,
        node_modules = "//:node_modules",
        chdir = native.package_name(),
        fixed_args = [
            "'**/*+(.|_)spec.js'",
        ],
        **kwargs
    )

def esbuild_checked_in(name, platform = None, config = {}, **kwargs):
    """
    Runs esbuild with a default Node.js banner configuration if needed.
    The user's provided 'config' settings will always take precedence.
    """

    # Define a default configuration for the Node.js platform.
    # This adds a 'require' shim needed by esbuild for ES Modules.
    node_defaults = {
        "banner": {
            "js": "import { createRequire } from 'node:module';globalThis['require'] ??= createRequire(import.meta.url);",
        },
    }

    # If the platform is "node", merge the user's config on top of the defaults.
    # Otherwise, just use the user's config.
    effective_config = (
        {k: v for k, v in node_defaults.items() + config.items()} if platform == "node" else config
    )

    _esbuild(
        name = "%s_generated" % name,
        platform = platform,
        config = effective_config,
        sourcemap = "inline",
        **kwargs
    )

    # ESBuild adds comments and function identifiers with the name of their module
    # location. e.g. `"bazel-out/x64_windows-fastbuild/bin/node_modules/a"function(exports)`.
    # We strip all of these paths as that would break approval of the he checked-in files within
    # different platforms (e.g. RBE running with K8). Additionally these paths depend
    # on the non-deterministic hoisting of the package manager across all platforms.
    native.genrule(
        name = "%s_sanitized" % name,
        srcs = ["%s_generated" % name],
        outs = ["%s_sanitized.js" % name],
        cmd = """cat $< | sed -E "s#(bazel-out|node_modules)/[^\\"']+##g" > $@""",
    )

    _write_source_file(
        name = name,
        out_file = "%s.js" % name,
        in_file = ":%s_sanitized" % name,
    )
