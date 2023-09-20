load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")

def _extract_api_to_json(ctx):
    """Implementation of the extract_api_to_json rule"""

    # Define arguments that will be passed to the underlying nodejs program.
    args = ctx.actions.args()

    # Pass the module_name for the extracted APIs. This will be something like "@angular/core".
    args.add(ctx.attr.module_name)

    # Pass the set of source files from which API reference data will be extracted.
    args.add_joined(ctx.files.srcs, join_with = ",")

    # Pass the name of the output JSON file.
    json_output = ctx.outputs.output_name
    args.add(json_output.path)

    # Define an action that runs the nodejs_binary executable. This is
    # the main thing that this rule does.
    run_node(
        ctx = ctx,
        inputs = depset(ctx.files.srcs),
        executable = "_extract_api_to_json",
        outputs = [json_output],
        arguments = [args],
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output JSON files.
    return [DefaultInfo(files = depset([json_output]))]

extract_api_to_json = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _extract_api_to_json,
    doc = """Rule that extracts Angular API reference information from TypeScript
             sources and write it to a JSON file""",

    # The attributes that can be set to this rule.
    attrs = {
        "srcs": attr.label_list(
            doc = """The source files for this rule. This must include one or more
                    TypeScript files.""",
            allow_empty = False,
            allow_files = True,
        ),
        "output_name": attr.output(
            doc = """Name of the JSON output file.""",
        ),
        "module_name": attr.string(
            doc = """JS Module name to be used for the extracted symbols""",
            mandatory = True,
        ),

        # The executable for this rule (private).
        "_extract_api_to_json": attr.label(
            default = Label("//api-gen/extraction:extract_api_to_json"),
            executable = True,
            cfg = "exec",
        ),
    },
)
