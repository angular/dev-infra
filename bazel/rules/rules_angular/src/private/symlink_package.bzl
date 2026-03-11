load("@aspect_rules_js//js:providers.bzl", "JsInfo", "js_info")
load("@bazel_lib//lib:paths.bzl", "relative_file")

DOC = """
Rule that symlinks a `//:node_modules/<pkg>` into another `node_modules` folder.

This is useful for enabling a compiler-cli or typescript version from HEAD,
or configured in the consuming repository.
"""

def manifest_path(ctx, file):
    # If a short path starts with `../`, then the file is from an external
    # workspace and we can just strip off the leading segment.
    if file.short_path.startswith("../"):
        return file.short_path[3:]

    return "%s/%s" % (ctx.workspace_name, file.short_path)

def _symlink_impl(ctx):
    src = ctx.attr.src
    store_info = src[JsInfo].npm_package_store_infos.to_list()

    if len(store_info) == 0:
        fail("%s has no \"npm_package_store_infos\". Ensure that is marked as a dependency and not devDependency." % ctx.attr.name)

    src_dir = store_info[0].package_store_directory

    destination = ctx.actions.declare_symlink(ctx.attr.name)
    destination_build = ctx.actions.declare_symlink(
        ctx.attr.name.replace("node_modules/", "node_modules_for_build/"),
    )

    # TODO(devversion): Revisit this with Bazel 7/8 and their new output layout!
    # This currently generates two symlinked node module structures. One for build actions
    # running in `bazel-out/../bin` and one for inside `.runfiles` (runtime execution).
    # This is unfortunately necessary because we have two different folder structures in how
    # we can reference the sources that potentially reside in a whole different Bazel repository.
    # See the first layout for build actions:
    #     bin/
    #       node_modules/... <-- This folder the symlinks are based on!
    #       external/rules_angular/src/worker/...
    # to -->
    #     .runfiles
    #       angular_framework/node_modules <--- Different location of pnpm store! :/
    #       rules_angular/src/worker/...
    # -----
    # We can solve this by generating two symlinks. One symlink node modules structure
    # that is picked up by build actions (via path mappings in the `tsconfig.json`) and one
    # real `node_modules/` folder that is picked up by NodeJS at runtime.

    ctx.actions.symlink(
        output = destination_build,
        # Note: arguments order is swapped compared to NodeJS `path.relative`.
        target_path = relative_file(src_dir.path, destination.path),
    )

    src_manifest_path = manifest_path(ctx, src_dir)
    destination_manifest_path = manifest_path(ctx, destination)

    ctx.actions.symlink(
        output = destination,
        # Note 1: arguments order is swapped compared to NodeJS `path.relative`.
        # Note 2: This path is for the `.runfiles` layout where destination workspace is a
        #   sibling with its actual workspace name. Hence we use manifest paths for computation.
        target_path = relative_file(src_manifest_path, destination_manifest_path),
    )

    runfiles = ctx.runfiles(files = [destination, destination_build])

    return [
        DefaultInfo(
            files = depset([destination], transitive = [ctx.attr.src[DefaultInfo].files]),
            runfiles = runfiles.merge(ctx.attr.src[DefaultInfo].default_runfiles),
        ),
        js_info(
            target = ctx.label,
            sources = src[JsInfo].sources,
            types = src[JsInfo].types,
            transitive_sources = src[JsInfo].transitive_sources,
            transitive_types = src[JsInfo].transitive_types,
            npm_package_store_infos = src[JsInfo].npm_package_store_infos,
            npm_sources = depset(
                [destination, destination_build],
                transitive = [src[JsInfo].npm_sources],
            ),
        ),
    ]

symlink_package = rule(
    implementation = _symlink_impl,
    attrs = {
        "src": attr.label(mandatory = True, providers = []),
    },
)
