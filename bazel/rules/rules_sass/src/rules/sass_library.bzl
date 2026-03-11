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

"""The `sass_library` rule for grouping and exposing Sass files for compilations."""

load("@bazel_lib//lib:copy_to_bin.bzl", "COPY_FILE_TO_BIN_TOOLCHAINS", "copy_file_to_bin_action")
load("@rules_sass//src/shared:collect_transitive.bzl", "collect_transitive_mappings", "collect_transitive_sources")
load("@rules_sass//src/shared:extensions.bzl", "ALLOWED_SRC_FILE_EXTENSIONS")
load("@rules_sass//src/shared:providers.bzl", "SassInfo")

def _sass_library_impl(ctx):
    """sass_library collects all transitive sources for given srcs and deps."""

    # We always copy all Sass files to bazel-bin for more predictable file layouts.
    copied_srcs = []
    for src in ctx.files.srcs:
        copied_srcs.append(copy_file_to_bin_action(ctx, src))

    transitive_sources = collect_transitive_sources(
        copied_srcs,
        ctx.attr.deps,
    )

    return [
        SassInfo(
            transitive_sources = transitive_sources,
            module_mappings = collect_transitive_mappings(ctx.attr.deps),
        ),
        DefaultInfo(
            files = transitive_sources,
            runfiles = ctx.runfiles(transitive_files = transitive_sources),
        ),
    ]

sass_library = rule(
    implementation = _sass_library_impl,
    toolchains = COPY_FILE_TO_BIN_TOOLCHAINS,
    attrs = {
        "srcs": attr.label_list(
            doc = "Sass source files",
            allow_files = ALLOWED_SRC_FILE_EXTENSIONS,
            allow_empty = False,
            mandatory = True,
        ),
        "deps": attr.label_list(
            doc = "sass_library targets to include in the compilation",
            providers = [SassInfo],
            allow_files = False,
        ),
    },
)
