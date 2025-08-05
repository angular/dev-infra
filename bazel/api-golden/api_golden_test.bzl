load("@aspect_bazel_lib//lib:copy_to_directory.bzl", "copy_to_directory")
load("@aspect_rules_js//npm:defs.bzl", "npm_package")
load("@bazel_skylib//rules:write_file.bzl", "write_file")
load("//bazel/api-golden:api_golden_test_npm_package.bzl", "api_golden_test_npm_package", "default_strip_export_pattern")

def api_golden_test(
        name,
        golden,
        entry_point,
        data = [],
        strip_export_pattern = default_strip_export_pattern,
        types = {},
        **kwargs):
    # We can't directly write `package.json` as this could cause conflicts
    # if there are multiple individual file tests in the same Bazel package.
    write_file(
        name = "%s_synthetic_package_json" % name,
        out = "%s_package.json" % name,
        content = [json.encode({
            "name": name,
            "exports": {
                ".": {
                    "types": entry_point,
                },
            },
        })],
    )

    npm_package(
        name = "%s_js_package" % name,
        srcs = data,
        testonly = True,
    )

    copy_to_directory(
        name = "%s_synthetic_package" % name,
        srcs = [
            "%s_synthetic_package_json" % name,
            "%s_js_package" % name,
        ],
        testonly = True,
        replace_prefixes = {
            "%s_" % name: "",
            "%s_js_package/" % name: "",
        },
    )

    api_golden_test_npm_package(
        name = name,
        golden_dir = golden,
        data = [":%s_synthetic_package" % name] + data,
        npm_package = "%s/%s_synthetic_package" % (native.package_name(), name),
        strip_export_pattern = strip_export_pattern,
        types = types,
        **kwargs
    )
