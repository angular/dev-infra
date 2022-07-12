load("//bazel/private:manifest_path.bzl", "get_manifest_path")

def _filter_outputs_impl(ctx):
    outputs = []
    target_label = ctx.attr.target.label
    target_workspace = target_label.workspace_name if target_label.workspace_name else ctx.workspace_name
    target_package_manifest_path = "%s/%s" % (target_workspace, target_label.package)
    used_filters = dict()

    for output in ctx.attr.target[DefaultInfo].files.to_list():
        manifest_path = get_manifest_path(ctx, output)
        relative_path = manifest_path[len(target_package_manifest_path) + 1:]

        for filter in ctx.attr.filters:
            if filter == relative_path:
                used_filters[filter] = True
                outputs.append(output)

    # If some filters are unused, we report an error as we expect every filter to\
    # be matched at least once.
    if len(used_filters) != len(ctx.attr.filters):
        unused_filters = [f for f in ctx.attr.filters if not used_filters.get(f)]
        fail("Some filters in `%s` do not match. Unused filters: %s" % (ctx.label, unused_filters))

    return [DefaultInfo(files = depset(outputs))]

filter_outputs = rule(
    implementation = _filter_outputs_impl,
    attrs = {
        "target": attr.label(
            mandatory = True,
            doc = "Target for which outputs should be filtered",
            providers = [DefaultInfo],
        ),
        "filters": attr.string_list(
            mandatory = True,
            doc = """Outputs to filter from the target. Each filter is expected to match
              at least once. Filter paths are expected to be relative to the package owning the target.
            """,
        ),
    },
    doc = """Rule that can be used to filter outputs from a given target.
      This is useful when a target exposes multiple output files but a single output is only needed.
    """,
)
