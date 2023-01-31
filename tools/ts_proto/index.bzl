load("@npm//:protobufjs-cli/package_json.bzl", "bin")
load("//tools:defaults_new.bzl", "js_library", "write_source_files")
load("@aspect_bazel_lib//lib:copy_file.bzl", "copy_file")

def generate_ts_proto_module(name, protofile, visibility = None):
    """Generate a typescript module for decoding a proto binary file based
      on a provided .proto file."""

    js_file = name + "_pb.js"
    d_ts_file = name + "_pb.d.ts"
    protofile_bin_name = "proto_file_%s" % name

    copy_file(
        name = protofile_bin_name,
        src = protofile,
        out = "proto_input_%s.proto" % name,
    )

    bin.pbjs(
        name = "generate_js_" + name,
        srcs = [
            ":%s" % protofile_bin_name,
            "//tools/ts_proto:esm-wrapper",
        ],
        copy_srcs_to_bin = False,
        testonly = True,
        args = [
            "-t",
            "static-module",
            "--dependency",
            "protobufjs",
            "--es6",
            "-w",
            "$(rootpath //tools/ts_proto:esm-wrapper)",
            "$(rootpath :%s)" % protofile_bin_name,
        ],
        stdout = "generated_" + js_file,
    )

    bin.pbts(
        name = "generate_ts_" + name,
        srcs = [":generate_js_%s" % name],
        copy_srcs_to_bin = False,
        testonly = True,
        args = [
            "$(rootpath :generate_js_%s)" % name,
        ],
        stdout = "generated_" + d_ts_file,
    )

    write_source_files(
        name = name + "_files",
        files = {
            d_ts_file: ":generated_" + d_ts_file,
            js_file: ":generated_" + js_file,
        },
        testonly = True,
    )

    js_library(
        name = name,
        srcs = [
            d_ts_file,
            js_file,
        ],
        deps = [
            "//:node_modules/protobufjs",
        ],
        visibility = visibility,
    )
