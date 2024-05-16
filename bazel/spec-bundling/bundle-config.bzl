def _spec_bundle_config_file_impl(ctx):
    run_angular_linker = ctx.attr.run_angular_linker
    downlevel_async_await = ctx.attr.downlevel_async_await
    linker_unknown_declaration_handling = ctx.attr.linker_unknown_declaration_handling

    ctx.actions.expand_template(
        template = ctx.file._template,
        output = ctx.outputs.output_name,
        substitutions = {
            "TMPL_RUN_LINKER": "true" if run_angular_linker else "false",
            "TMPL_DOWNLEVEL_ASYNC_AWAIT": "true" if downlevel_async_await else "false",
            "TMPL_LINKER_UNKNOWN_DECLARATION_HANDLING": ("'%s'" % linker_unknown_declaration_handling) if linker_unknown_declaration_handling else "undefined",
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
        "downlevel_async_await": attr.bool(
            doc = "Whether to downlevel async/await syntax.",
            default = True,
        ),
        "output_name": attr.output(
            mandatory = True,
            doc = "Name of the file where the config should be written to.",
        ),
        "linker_unknown_declaration_handling": attr.string(
            values = ["ignore", "warn", "error"],
            doc = """Controls how unknown declaration versions should be handled by the Angular linker.
              https://github.com/angular/angular/blob/f94c6f433dba3924b79f137cfcc49d2dfd4d679c/packages/compiler-cli/linker/src/file_linker/linker_options.ts#L27-L39.
            """,
        ),
        "_template": attr.label(
            allow_single_file = True,
            default = "//bazel/spec-bundling:esbuild.config-tmpl.mjs",
        ),
    },
)
