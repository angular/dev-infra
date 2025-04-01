load("@aspect_rules_esbuild//esbuild:defs.bzl", "esbuild")
load("@devinfra//bazel/spec-bundling:spec-entrypoint.bzl", "spec_entrypoint")

def spec_bundle(name, deps, bootstrap = [], testonly = True, config = {}, **kwargs):
    spec_entrypoint(
        name = "%s_entrypoint" % name,
        deps = deps,
        bootstrap = bootstrap,
        testonly = testonly,
    )

    esbuild(
        name = name,
        # Note: `deps` are added here to automatically collect transitive NPM
        # sources etc. and make them available for bundling.
        srcs = deps + [
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
        minify = True,
        sourcemap = "external",
        platform = "node",
        entry_point = ":%s_entrypoint" % name,
        output = "%s.spec.js" % name,
        **kwargs
    )

def spec_bundle_amd(name, workspace_name, **kwargs):
    amd_name = "%s/%s/%s" % (workspace_name, native.package_name(), name + ".spec")

    spec_bundle(
        name,
        config = {
            "globalName": "__exports",
            "banner": {"js": "define(\"%s\", [], function() {" % amd_name},
            "footer": {"js": "return __exports;})"},
        },
        **kwargs
    )
