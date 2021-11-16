def _spec_bundle_config_file_impl(ctx):
    ctx.actions.expand_template(
        template = ctx.file._template,
        output = ctx.outputs.output_name,
        substitutions = {
            "TMPL_RUN_LINKER": "true" if ctx.attr.run_angular_linker else "false",
        },
    )

spec_bundle_config_file = rule(
    implementation = _spec_bundle_config_file_impl,
    doc = "Generates an ESBuild configuration file for bundling specs",
    attrs = {
        "run_angular_linker": attr.bool(
            doc = "Whether the Angular linker should process all files.",
            default = False,
        ),
        "output_name": attr.output(
            mandatory = True,
            doc = "Name of the file where the config should be written to.",
        ),
        "_template": attr.label(
            allow_single_file = True,
            default = "//bazel/spec-bundling:esbuild.config-tmpl.mjs",
        ),
    },
)
