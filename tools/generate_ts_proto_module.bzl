load("@build_bazel_rules_nodejs//:index.bzl", "generated_file_test", "js_library", "npm_package_bin")

def generate_ts_proto_module(name, protofile, visibility = ["//visibility:public"]):
    """
    Generate a typescript module for decoding a proto binary file based on a provided .proto file.
    """

    # Runtime dependencies, if not already installed, are installed by protobufjs via `npm install`
    # during the execution. As `npm_package_bin` isolates the execution from the rest of
    # node_modules, these expected dependencies must be provided.
    # The check and install of the dependencies is performed in this code block:
    #   https://github.com/protobufjs/protobuf.js/blob/v6.11.2/cli/util.js#L135
    protobufjs_dependencies = [
        "@npm//semver",
        "@npm//chalk",
        "@npm//jsdoc",
        "@npm//minimist",
        "@npm//uglify-js",
    ]
    js_file = name + "_pb.js"
    d_ts_file = name + "_pb.d.ts"

    npm_package_bin(
        name = "generate_js_" + name,
        tool = "@npm//protobufjs/bin:pbjs",
        data = protobufjs_dependencies + [
            protofile,
        ],
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
        tool = "@npm//protobufjs/bin:pbts",
        data = protobufjs_dependencies + [
            ":generate_js_%s" % name,
        ],
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
