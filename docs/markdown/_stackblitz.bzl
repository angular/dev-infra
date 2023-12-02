load("@build_bazel_rules_nodejs//:providers.bzl", "run_node")

def _generate_stackblitz(ctx):
    """Implementation of the markdown rule"""

    # Determine the stackblitz template base directory
    stackblitz_template = " " * 1000
    for file in ctx.files.stackblitz_template:
        file_path = file.dirname
        if (len(file_path) < len(stackblitz_template)):
            stackblitz_template = file_path

    # File declaration of the generated html file
    html_output = ctx.actions.declare_file("%s.html" % ctx.attr.name)

    # Temporary directory for the generation to utilize
    tmp_directory = ctx.actions.declare_directory("TMP_" + ctx.label.name)

    # Set the arguments for the actions inputs and output location.
    args = ctx.actions.args()

    # Path to the example being generated.
    args.add(ctx.attr.example.label.package)

    # Path to the actions temporary directory.
    args.add(tmp_directory.short_path)

    # Path to the stackblitz template
    args.add(stackblitz_template)

    # Path to the html output file to write to.
    args.add(html_output.path)

    ctx.runfiles(files = ctx.files.stackblitz_template)

    run_node(
        ctx = ctx,
        inputs = depset(ctx.files.example + ctx.files.stackblitz_template),
        executable = "_generate_stackblitz",
        outputs = [html_output, tmp_directory],
        arguments = [args],
    )

    # The return value describes what the rule is producing. In this case we need to specify
    # the "DefaultInfo" with the output html files.
    return [DefaultInfo(files = depset([html_output]))]

generate_stackblitz = rule(
    # Point to the starlark function that will execute for this rule.
    implementation = _generate_stackblitz,
    doc = """Rule that renders markdown sources to html""",

    # The attributes that can be set to this rule.
    attrs = {
        "example": attr.label(
            doc = """Files used for the stackblitz generation.""",
        ),
        "stackblitz_template": attr.label(
            doc = """The stackblitz template directory to base generated stackblitz on.""",
            default = Label("//docs/markdown/examples/template:files"),
        ),
        "_generate_stackblitz": attr.label(
            default = Label("//docs/markdown:stackblitz"),
            executable = True,
            cfg = "exec",
        ),
    },
)
