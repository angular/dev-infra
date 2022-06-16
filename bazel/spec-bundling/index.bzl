load("@build_bazel_rules_nodejs//:index.bzl", "js_library")
load("//bazel/esbuild:index.bzl", "esbuild", "esbuild_amd", "esbuild_config", "esbuild_esm_bundle")
load("//bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")
load("//bazel/spec-bundling:bundle-config.bzl", "spec_bundle_config_file")

def spec_bundle(
        name,
        deps,
        platform,
        bootstrap = [],
        run_angular_linker = False,
        # We cannot use `ES2017` or higher as that would result in `async/await` not being downleveled.
        # ZoneJS needs to be able to intercept these as otherwise change detection would not work properly.
        target = "es2016",
        external = [],
        workspace_name = None):
    """Macro that will bundle all test files with their respective transitive dependencies.

    Bundled specs end up in a single bundle file that can be loaded within Karma or NodeJS directly.
    This is helpful as Angular framework packages do not ship UMD files and to avoid overall
    complexity with maintaining a runtime loader such as RequireJS or SystemJS.

    Args:
        name: Name of the spec bundle target
        deps: Targets that contain all spec files. Files ending with `spec.js`
          are picked up.
        platform: Platform for which spec should be bundled. i.e. `node`, `browser` or `cjs-legacy`.
        bootstrap: Targets providing bootstrap scripts that run before the specs. Files
          ending with `init.js` are picked up.
        target: Target ECMAScript to use for the specs bundle.
        run_angular_linker: Whether the Angular linker should process the bundled code.
        external: List of modules/packages which should not be bundled.
        workspace_name: Workspace name that needs to be provided for the AMD module name.
    """

    is_browser_test = platform == "browser"
    is_legacy_cjs = platform == "cjs-legacy"
    is_node = platform == "node"

    package_name = native.package_name()
    esbuild_attrs = dict()

    spec_entrypoint(
        name = "%s_spec_entrypoint" % name,
        deps = deps,
        bootstrap = bootstrap,
        testonly = True,
    )

    spec_bundle_config_file(
        name = "%s_config_file" % name,
        testonly = True,
        output_name = "%s_config.mjs" % name,
        run_angular_linker = run_angular_linker,
    )

    esbuild_config(
        name = "%s_config" % name,
        config_file = ":%s_config_file" % name,
        testonly = True,
        deps = ["//shared-scripts/angular-linker:js_lib"],
    )

    if is_browser_test and not workspace_name:
        fail("The spec-bundling target %s is declared as browser test. In order to be able " +
             "to construct an AMD module name, the `workspace_name` attribute needs to be set.")

    esbuild_rule = None

    if is_browser_test:
        esbuild_rule = esbuild_amd
        amd_name = "%s/%s/%s" % (workspace_name, package_name, name + "_spec")
        esbuild_attrs["platform"] = "browser"
        esbuild_attrs["output"] = "%s_spec.js" % name
        esbuild_attrs["module_name"] = amd_name
    elif is_legacy_cjs:
        esbuild_rule = esbuild
        esbuild_attrs["format"] = "iife"
        esbuild_attrs["platform"] = "node"
        esbuild_attrs["output"] = "%s_spec.js" % name
    elif is_node:
        esbuild_rule = esbuild_esm_bundle
        esbuild_attrs["platform"] = "node"
        esbuild_attrs["output"] = "%s_spec.mjs" % name

    esbuild_rule(
        name = "%s_bundle" % name,
        testonly = True,
        config = ":%s_config" % name,
        entry_point = ":%s_spec_entrypoint" % name,
        target = target,
        deps = deps + [":%s_spec_entrypoint" % name],
        link_workspace_root = True,
        external = external,
        **esbuild_attrs
    )

    js_library(
        name = name,
        testonly = True,
        named_module_srcs = [":%s_bundle" % name],
    )
