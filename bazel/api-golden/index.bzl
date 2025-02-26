load("@bazel_skylib//rules:write_file.bzl", "write_file")
load("@build_bazel_rules_nodejs//:index.bzl", "pkg_npm")
load("//bazel/api-golden:index_rjs.bzl", _rjs_api_golden_test_npm_package = "api_golden_test_npm_package")

default_strip_export_pattern = "^ɵ(?!ɵdefineInjectable|ɵinject|ɵInjectableDef)"

def extract_names_from_npm_targets(type_targets):
    types = {}

    for type_target in type_targets:
        type_label = Label(type_target)
        type_package = type_label.package

        if type_label.workspace_name != "npm" or not type_package.startswith("@types/"):
            fail("Expected type targets to be part of the `@npm` workspace." +
                 "e.g. `@npm//@types/nodes`.")

        types[type_target] = type_package[len("@types/"):]

    return types

def api_golden_test(
        name,
        golden,
        entry_point,
        data = [],
        strip_export_pattern = default_strip_export_pattern,
        types = [],
        **kwargs):
    write_file(
        name = "%s_synthetic_package_json" % name,
        out = "package.json",
        content = [json.encode({
            "name": name,
            "exports": {
                ".": {
                    "types": entry_point,
                },
            },
        })],
    )

    pkg_npm(
        name = "%s_synthetic_package" % name,
        deps = data + ["%s_synthetic_package_json" % name],
        testonly = True,
    )

    _rjs_api_golden_test_npm_package(
        no_copy_to_bin = types,
        name = name,
        golden_dir = fixup_path_for_rules_js(golden),
        data = [":%s_synthetic_package" % name] + data,
        npm_package = "%s/%s_synthetic_package" % (native.package_name(), name),
        strip_export_pattern = strip_export_pattern,
        types = extract_names_from_npm_targets(types),
        interop_mode = True,
        **kwargs
    )

def api_golden_test_npm_package(
        name,
        golden_dir,
        npm_package,
        data = [],
        strip_export_pattern = default_strip_export_pattern,
        types = [],
        **kwargs):
    _rjs_api_golden_test_npm_package(
        name = name,
        no_copy_to_bin = types,
        golden_dir = fixup_path_for_rules_js(golden_dir),
        npm_package = fixup_path_for_rules_js(npm_package),
        data = data,
        strip_export_pattern = strip_export_pattern,
        types = extract_names_from_npm_targets(types),
        interop_mode = True,
        **kwargs
    )

def fixup_path_for_rules_js(p):
    segs = p.split("/")
    return "/".join(segs[1:])
