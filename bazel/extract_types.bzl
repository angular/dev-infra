load("@aspect_rules_js//js:providers.bzl", "JsInfo")

def _extract_types_impl(ctx):
    """Implementation of the `extract_types` rule."""
    types_files = []

    for dep in ctx.attr.deps:
        if JsInfo in dep:
            types_files.extend(dep[JsInfo].transitive_types.to_list())
            types_files.extend(dep[JsInfo].types.to_list())

    types = depset([file for file in types_files if file.short_path.startswith(ctx.label.package)])

    return [
        DefaultInfo(files = types),
    ]

extract_types = rule(
    implementation = _extract_types_impl,
    doc = """
      Rule that collects all direct and transitive type definitions of specified targets. The
      definitons are then exposed through the `DefaultInfo` provider, allowing for easy
      consumption in other rules.

      This rule can be helpful if TypeScript typings are shipped along with bundled runtime code.
    """,
    attrs = {
        "deps": attr.label_list(
            doc = """List of targets for which all direct and transitive type definitions
              should be collected.""",
            allow_files = True,
            mandatory = True,
        ),
    },
)
