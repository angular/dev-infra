load("@build_bazel_rules_nodejs//:index.bzl", "js_library")
load("//bazel/esbuild:index.bzl", "esbuild", "esbuild_amd", "esbuild_config")
load("//bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")
load("//bazel/spec-bundling:bundle-config.bzl", "spec_bundle_config_file")

"""
  Starlark file exposing a macro for bundling Bazel targets with spec files into
  a single spec ESM/AMD file. Bundling is helpful as it avoids unnecessary complexity
  with module resolution at runtime with loaders such as SystemJS or RequireJS.

  Additionally, given that Angular framework packages do no longer ship UMD bundles,
  bundling simplifies the integration of those FW packages significantly. It also helps
  with incorporating Angular linker-processed output of library ESM files.
"""

def spec_bundle(
        name,
        deps,
        platform,
        run_angular_linker = False,
        # We cannot use `ES2017` or higher as that would result in `async/await` not being downleveled.
        # ZoneJS needs to be able to intercept these as otherwise change detection would not work properly.
        target = "es2016",
        workspace_name = None,
        **kwargs):
    """
      Macro that will bundle all test files, with their respective transitive dependencies,
      into a single bundle file that can be loaded within Karma or NodeJS directly. Test files
      are bundled as Angular framework packages do not ship UMD files and to avoid overall
      complexity with maintaining a runtime loader such as RequireJS or SystemJS.
    """

    is_browser_test = platform == "browser"
    package_name = native.package_name()

    spec_entrypoint(
        name = "%s_spec_entrypoint" % name,
        deps = deps,
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

    # Browser tests (Karma) need named AMD modules to load.
    # TODO(devversion): consider updating `@bazel/concatjs` to support loading JS files directly.
    esbuild_rule = esbuild_amd if is_browser_test else esbuild
    amd_name = "%s/%s/%s" % (workspace_name, package_name, name + "_spec") if is_browser_test else None

    esbuild_rule(
        name = "%s_bundle" % name,
        testonly = True,
        config = ":%s_config" % name,
        entry_point = ":%s_spec_entrypoint" % name,
        module_name = amd_name,
        output = "%s_spec.js" % name,
        target = target,
        platform = platform,
        deps = deps + [":%s_spec_entrypoint" % name],
        link_workspace_root = True,
        **kwargs
    )

    js_library(
        name = name,
        testonly = True,
        named_module_srcs = [":%s_bundle" % name],
    )
