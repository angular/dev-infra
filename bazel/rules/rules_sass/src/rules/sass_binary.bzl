# Copyright 2025 The Bazel Authors. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# Fork of: https://github.com/bazelbuild/rules_sass.

"Compile Sass files to CSS"

load("@bazel_lib//lib:copy_to_bin.bzl", "COPY_FILE_TO_BIN_TOOLCHAINS", "copy_file_to_bin_action")
load("@rules_sass//src/shared:collect_transitive.bzl", "collect_transitive_mappings", "collect_transitive_sources")
load("@rules_sass//src/shared:extensions.bzl", "ALLOWED_SRC_FILE_EXTENSIONS")
load("@rules_sass//src/shared:providers.bzl", "SassInfo")

def _run_sass(ctx, input, css_output, compiler_binary, map_output = None):
    """run_sass performs an action to compile a single Sass file into CSS."""

    # Create mappings manifest for our custom Dart importer.
    # We also adjust the package-relative mappings to execroot paths.
    mappings_config = ctx.actions.declare_file("%s_mappings.json" % ctx.attr.name)

    # Set initial module_mappings using the transitive mappings from dependency mappings.
    module_mappings = collect_transitive_mappings(ctx.attr.deps)
    for (key, value) in ctx.attr.module_mappings.items():
        module_mappings[key] = "%s/%s/%s" % (ctx.bin_dir.path, ctx.label.package, value)
    ctx.actions.write(
        output = mappings_config,
        content = json.encode(module_mappings),
    )

    # The Sass CLI expects inputs like
    # sass <flags> <input_filename> <output_filename>
    args = ctx.actions.args()

    # Add module mappings path as first argument to our custom Sass binary.
    args.add(mappings_config.path)

    # By default, the CLI of Sass writes the output file even if compilation failures have been
    # reported. We don't want this behavior in the Bazel action, as writing the actual output
    # file could let the compilation action appear successful. Instead, if we do not write any
    # file on error, Bazel will never report the action as successful if an error occurred.
    # https://sass-lang.com/documentation/cli/dart-sass#error-css
    args.add("--no-error-css")

    # Flags (see https://github.com/sass/dart-sass/blob/master/lib/src/executable/options.dart)
    args.add_joined(["--style", ctx.attr.output_style], join_with = "=")

    if not ctx.attr.sourcemap:
        args.add("--no-source-map")
    elif ctx.attr.sourcemap_embed_sources:
        args.add("--embed-sources")

    # Sources for compilation are expected to only exist in the bazel-bin.
    # We copy all sources via `sass_library` and `sass_binary` to the bin directory.
    for prefix in [ctx.bin_dir.path]:
        args.add("--load-path=%s/" % prefix)
        for include_path in ctx.attr.include_paths:
            args.add("--load-path=%s/%s" % (prefix, include_path))

    # Last arguments are input and output paths
    # Note that the sourcemap is implicitly written to a path the same as the
    # css with the added .map extension.
    args.add_all([input.path, css_output.path])

    ctx.actions.run(
        mnemonic = "SassCompiler",
        executable = compiler_binary,
        inputs = collect_transitive_sources([input, mappings_config], ctx.attr.deps),
        tools = [compiler_binary],
        arguments = [args],
        outputs = [css_output, map_output] if map_output else [css_output],
    )

def _sass_binary_impl(ctx):
    # Make sure the output CSS is available in runfiles if used as a data dep.
    if ctx.attr.sourcemap:
        map_file = ctx.outputs.map_file
        outputs = [ctx.outputs.css_file, map_file]
    else:
        map_file = None
        outputs = [ctx.outputs.css_file]

    compiler_info = ctx.toolchains["@rules_sass//src/toolchain:toolchain_type"].sass_compiler
    compiler_binary = compiler_info.binary

    # We always copy all Sass files to bazel-bin for more predictable file layouts.
    copied_src = copy_file_to_bin_action(ctx, ctx.file.src)

    _run_sass(ctx, copied_src, ctx.outputs.css_file, compiler_binary, map_file)
    return DefaultInfo(runfiles = ctx.runfiles(files = outputs))

def _sass_binary_outputs(src, output_name, output_dir, sourcemap):
    output_name = output_name or _strip_extension(src.name) + ".css"
    css_file = "/".join([p for p in [output_dir, output_name] if p])

    outputs = {
        "css_file": css_file,
    }

    if sourcemap:
        outputs["map_file"] = "%s.map" % css_file

    return outputs

def _strip_extension(path):
    """Removes the final extension from a path."""
    components = path.split(".")
    components.pop()
    return ".".join(components)

sass_binary = rule(
    implementation = _sass_binary_impl,
    outputs = _sass_binary_outputs,
    attrs = {
        "src": attr.label(
            doc = "Sass entrypoint file",
            mandatory = True,
            allow_single_file = ALLOWED_SRC_FILE_EXTENSIONS,
        ),
        "sourcemap": attr.bool(
            default = True,
            doc = "Whether source maps should be emitted.",
        ),
        "sourcemap_embed_sources": attr.bool(
            default = False,
            doc = "Whether to embed source file contents in source maps.",
        ),
        "include_paths": attr.string_list(
            doc = "Additional directories to search when resolving imports",
        ),
        "output_dir": attr.string(
            doc = "Output directory, relative to this package.",
            default = "",
        ),
        "output_name": attr.string(
            doc = """Name of the output file, including the .css extension.

                By default, this is based on the `src` attribute: if `styles.scss` is
                the `src` then the output file is `styles.css.`.
                You can override this to be any other name.
                Note that some tooling may assume that the output name is derived from
                the input name, so use this attribute with caution.""",
            default = "",
        ),
        "output_style": attr.string(
            doc = "How to style the compiled CSS",
            default = "expanded",
            values = [
                "expanded",
                "compressed",
            ],
        ),
        "deps": attr.label_list(
            doc = "sass_library targets to include in the compilation",
            providers = [SassInfo],
            allow_files = False,
        ),
        "module_mappings": attr.string_dict(
            doc = """Dictionary of module names to their package-relative folders.
              This enables module mappings as with a custom loader but doesn't require slower JavaScript Sass.
            """,
        ),
    },
    toolchains = ["@rules_sass//src/toolchain:toolchain_type"] + COPY_FILE_TO_BIN_TOOLCHAINS,
)
