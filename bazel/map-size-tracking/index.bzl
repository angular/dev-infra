# Copyright Google LLC
#
# Use of this source code is governed by an MIT-style license that can be
# found in the LICENSE file at https://angular.io/license

load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test")

nodejs_args = ["--nobazel_run_linker"]

def js_mapping_size_test(
        name,
        src,
        source_map,
        golden_file,
        max_percentage_diff,
        max_byte_diff,
        **kwargs):
    """Track the size of a given input file by inspecting the corresponding source map.

    A golden file is used to compare the current file size data against previously approved file size data

    Args:
      name: Name of the test target
      src: Label pointing to the script to be analyzed.
      source_map: Label pointing to the JavaScript map file.
      golden_file: Label pointing to the golden JSON file.
      max_percentage_diff: Limit percentage difference that would result in test failures.
      max_byte_diff: Limit relative byte difference that would result in test failures.
      **kwargs: Additional arguments being passed to the NodeJS test target.
    """

    all_data = ["//bazel/map-size-tracking", src, source_map, golden_file]
    entry_point = "//bazel/map-size-tracking:index.ts"

    nodejs_test(
        name = name,
        data = all_data,
        entry_point = entry_point,
        templated_args = nodejs_args + [
            "$(rootpath %s)" % src,
            "$(rootpath %s)" % source_map,
            "$(rootpath %s)" % golden_file,
            "%d" % max_percentage_diff,
            "%d" % max_byte_diff,
            "false",
        ],
        **kwargs
    )

    nodejs_binary(
        name = "%s.accept" % name,
        testonly = True,
        data = all_data,
        entry_point = entry_point,
        templated_args = nodejs_args + [
            "$(rootpath %s)" % src,
            "$(rootpath %s)" % source_map,
            "$(rootpath %s)" % golden_file,
            "0",
            "0",
            "true",
        ],
        **kwargs
    )
