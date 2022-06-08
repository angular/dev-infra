load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", "js_library", "npm_package_bin")

def generate_ts_proto_module(name, protofile, visibility = None):
    """Generate a typescript module for decoding a proto binary file based on a provided .proto file."""

    js_file = name + "_pb.js"
    d_ts_file = name + "_pb.d.ts"

    npm_package_bin(
        name = "generate_js_" + name,
        tool = "//tools/ts_proto:pbjs",
        data = [protofile],
        testonly = True,
        args = [
            "-t",
            "static-module",
            "-w",
            "commonjs",
            "$(execpath %s)" % protofile,
        ],
        stdout = "generated_" + js_file,
    )

    npm_package_bin(
        name = "generate_ts_" + name,
        tool = "//tools/ts_proto:pbts",
        data = [":generate_js_%s" % name],
        testonly = True,
        args = [
            "$(execpath :generate_js_%s)" % name,
        ],
        stdout = "generated_" + d_ts_file,
    )

    generated_file_test(
        name = name + "_dts",
        src = d_ts_file,
        testonly = True,
        generated = "generated_" + d_ts_file,
    )

    generated_file_test(
        name = name + "_js",
        testonly = True,
        src = js_file,
        generated = "generated_" + js_file,
    )

    js_library(
        name = name,
        srcs = [
            d_ts_file,
            js_file,
        ],
        deps = [
            "@npm//protobufjs",
        ],
        visibility = visibility,
    )
