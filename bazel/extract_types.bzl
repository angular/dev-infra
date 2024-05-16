load("@build_bazel_rules_nodejs//:providers.bzl", "DeclarationInfo")

def _extract_types_impl(ctx):
    """Implementation of the `extract_types` rule."""
    depsets = []

    for dep in ctx.attr.deps:
        if DeclarationInfo in dep:
            depsets.append(dep[DeclarationInfo].transitive_declarations)

    types = depset(transitive = depsets)

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
