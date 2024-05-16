# Copyright Google LLC
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "npm_package_bin")
load("@npm//@bazel/terser:index.bzl", "terser_minified")
load("@npm//prettier:index.bzl", "prettier")
load("//bazel/esbuild:index.bzl", "esbuild", "esbuild_config")
load("//bazel:expand_template.bzl", "expand_template")
load("//bazel:filter_outputs.bzl", "filter_outputs")

def _create_esbuild_minify_options(debug = False):
    # The minify options match with the configuration used by the CLI. The whitespace
    # minification is left to Terser. More details can be found here:
    # https://github.com/angular/angular-cli/blob/0d76bf04bca6e083865972b5398a32bbe9396e14/packages/angular_devkit/build_angular/src/webpack/plugins/javascript-optimizer-worker.ts#L133.
    return {
        "minifyIdentifiers": not debug,
        "minifySyntax": True,
        "minifyWhitespace": False,
    }

def app_bundle(
        name,
        entry_point,
        visibility = None,
        testonly = False,
        platform = "browser",
        target = "es2020",
        format = "iife",
        **kwargs):
    """
      Bundles an Angular applications in an optimized way that closely matches
      the compilation pipeline as within the Angular CLI.

      The rule produces a number of output bundles.

        JS                               : "%{name}.js"
        JS minified                      : "%{name}.min.js"
        JS minified (compressed)         : "%{name}.min.js.br",
        ----
        JS debug                         : "%{name}.debug.js"
        JS debug minified                : "%{name}.debug.min.js"
        JS debug minified (beautified)   : "%{name}.debug.min.beautified.js"
    """

    common_base_attributes = {
        "testonly": testonly,
        "visibility": visibility,
    }

    expand_template(
        name = "%s_config_file" % name,
        output_name = "%s_config.mjs" % name,
        template = "//bazel/app-bundling:esbuild.config-tmpl.mjs",
        substitutions = {
            "TMPL_ENTRY_POINT_ROOTPATH": "$(rootpath %s)" % entry_point,
        },
        data = [entry_point],
        **common_base_attributes
    )

    esbuild_config(
        name = "%s_esbuild_config" % name,
        config_file = ":%s_config_file" % name,
        deps = [
            "@npm//@angular/compiler-cli",
            "//shared-scripts/angular-optimization:js_lib",
        ],
        **common_base_attributes
    )

    common_esbuild_options = dict({
        "config": "%s_esbuild_config" % name,
        "entry_point": entry_point,
        "target": target,
        "platform": platform,
        "format": format,
        "sourcemap": "external",
    }, **common_base_attributes)

    common_terser_options = dict({
        "config_file": "//bazel/app-bundling:terser_config.json",
        "sourcemap": True,
    }, **common_base_attributes)

    esbuild(
        name = name,
        args = _create_esbuild_minify_options(False),
        **dict(kwargs, **common_esbuild_options)
    )

    esbuild(
        name = "%s.debug" % name,
        args = _create_esbuild_minify_options(True),
        **dict(kwargs, tags = ["manual"], **common_esbuild_options)
    )

    terser_minified(name = name + ".min", src = ":%s" % name, **common_terser_options)
    filter_outputs(name = name + ".min.js", target = ":%s.min" % name, filters = ["%s.min.js" % name], **common_base_attributes)
    filter_outputs(name = name + ".min.js.map", target = ":%s.min" % name, filters = ["%s.min.js.map" % name], **common_base_attributes)

    terser_minified(name = name + ".debug.min", src = ":%s.debug" % name, debug = True, tags = ["manual"], **common_terser_options)
    filter_outputs(name = name + ".debug.min.js", target = ":%s.debug.min" % name, filters = ["%s.debug.min.js" % name], **common_base_attributes)
    filter_outputs(name = name + ".debug.min.js.map", target = ":%s.debug.min" % name, filters = ["%s.debug.min.js.map" % name], **common_base_attributes)

    # For better debugging, we also run prettier on the minified debug bundle. This is
    # necessary as Terser no longer has beautify/formatting functionality.
    prettier(
        name = name + ".debug.min.beautified",
        args = ["$(execpath %s)" % (name + ".debug.min")],
        # The `outs` attribute needs to be set when `stdout` is captured as an output.
        outs = [],
        stdout = name + ".debug.min.beautified.js",
        data = [name + ".debug.min"],
        tags = ["manual"],
        **common_base_attributes
    )

    npm_package_bin(
        name = "_%s_brotli" % name,
        tool = "//bazel/app-bundling:brotli-compress",
        data = [name + ".min.js"],
        outs = [name + ".min.js.br"],
        args = [
            "--output=$(execpath %s.min.js.br)" % name,
            "$(execpath %s.min.js)" % name,
        ],
        **common_base_attributes
    )
