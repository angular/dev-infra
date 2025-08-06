load("@aspect_rules_js//js:providers.bzl", "JsInfo")

# A custom provider to pass along the npm package name for linked npm packages
NpmPackage = provider()

def _npm_package_aspect_impl(target, ctx):
    if (ctx.rule.kind == "npm_link_package_store"):
        package_name = ctx.rule.attr.package

        # TODO: Determine how to include the package field information in locally built npm package targets
        if package_name == "":
            package_name = target[JsInfo].npm_package_store_infos.to_list()[0].package
        return [NpmPackage(name = package_name)]
    return []

# Aspect to include the npm package name for use in strict deps checking.
_npm_package_aspect = aspect(
    implementation = _npm_package_aspect_impl,
    required_providers = [],
)

def _strict_deps_impl(ctx):
    sources = []

    allowed_sources = []
    allowed_module_names = []
    test_files = []

    # Whether or not the strict_deps check is expected to fail.
    expect_failure = "true" if ctx.attr.will_fail else "false"

    for dep in ctx.attr.deps:
        if JsInfo in dep:
            # Because each source maps to a corresponding type file, we can simply look at the type
            # files for the sources, this also allows for situations in which we only provide types.
            sources.append(dep[JsInfo].types)
        if NpmPackage in dep:
            allowed_module_names.append(dep[NpmPackage].name)

    for source in depset(transitive = sources).to_list():
        allowed_sources.append(source.short_path)

    for file in ctx.files.srcs:
        allowed_sources.append(file.short_path)
        if file.is_source:
            test_files.append(file.short_path)

    manifest = ctx.actions.declare_file("%s_strict_deps_manifest.json" % ctx.attr.name)
    ctx.actions.write(
        output = manifest,
        content = json.encode({
            # Note: Ensure this matches `StrictDepsManifest` from `manifest.mts`
            "testFiles": test_files,
            "allowedModuleNames": allowed_module_names,
            "allowedSources": allowed_sources,
        }),
    )

    launcher = ctx.actions.declare_file("%s_launcher.sh" % ctx.attr.name)
    ctx.actions.write(
        output = launcher,
        is_executable = True,
        # Bash runfile library taken from:
        # https://github.com/bazelbuild/bazel/blob/master/tools/bash/runfiles/runfiles.bash.
        content = """
            #!/usr/bin/env bash

            # --- begin runfiles.bash initialization v3 ---
            # Copy-pasted from the Bazel Bash runfiles library v3.
            set -uo pipefail; set +e; f=bazel_tools/tools/bash/runfiles/runfiles.bash
            # shellcheck disable=SC1090
            source "${RUNFILES_DIR:-/dev/null}/$f" 2>/dev/null || \
            source "$(grep -sm1 "^$f " "${RUNFILES_MANIFEST_FILE:-/dev/null}" | cut -f2- -d' ')" 2>/dev/null || \
            source "$0.runfiles/$f" 2>/dev/null || \
            source "$(grep -sm1 "^$f " "$0.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
            source "$(grep -sm1 "^$f " "$0.exe.runfiles_manifest" | cut -f2- -d' ')" 2>/dev/null || \
            { echo>&2 "ERROR: cannot find $f"; exit 1; }; f=; set -e
            # --- end runfiles.bash initialization v3 ---

            exec $(rlocation %s) $(rlocation %s) %s
        """ % (
            "%s/%s" % (ctx.workspace_name, ctx.files._bin[0].short_path),
            "%s/%s" % (ctx.workspace_name, manifest.short_path),
            expect_failure,
        ),
    )

    bin_runfiles = ctx.attr._bin[DefaultInfo].default_runfiles

    return [
        DefaultInfo(
            executable = launcher,
            runfiles = ctx.runfiles(
                files = ctx.files._runfiles_lib + ctx.files.srcs + [manifest],
            ).merge(bin_runfiles),
        ),
    ]

_strict_deps_test = rule(
    implementation = _strict_deps_impl,
    test = True,
    doc = "Rule to verify that specified TS files only import from explicitly listed deps.",
    attrs = {
        "deps": attr.label_list(
            aspects = [_npm_package_aspect],
            doc = "Direct dependencies that are allowed",
            default = [],
        ),
        "srcs": attr.label_list(
            doc = "TS files to be checked",
            allow_files = True,
            mandatory = True,
        ),
        "will_fail": attr.bool(
            doc = "Whether the test is expected to fail",
            default = False,
        ),
        "_runfiles_lib": attr.label(
            default = "@bazel_tools//tools/bash/runfiles",
        ),
        "_bin": attr.label(
            default = "@devinfra//bazel/ts_project/strict_deps:bin",
            executable = True,
            cfg = "exec",
        ),
    },
)

def strict_deps_test(**kwargs):
    kwargs["will_fail"] = False
    _strict_deps_test(**kwargs)

def invalid_strict_deps_test(**kwargs):
    kwargs["will_fail"] = True
    _strict_deps_test(**kwargs)
