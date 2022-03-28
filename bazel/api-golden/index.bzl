load("//bazel:extract_types.bzl", "extract_types")
load("@build_bazel_rules_nodejs//:index.bzl", "nodejs_binary", "nodejs_test")

nodejs_test_args = [
    # Needed so that node doesn't walk back to the source directory.
    # From there, the relative imports would point to .ts files.
    "--node_options=--preserve-symlinks",
    "--nobazel_run_linker",
]

default_strip_export_pattern = "^ɵ(?!ɵdefineInjectable|ɵinject|ɵInjectableDef)"

def _escape_regex_for_arg(value):
    """Escapes a Regular expression so that it can be passed as process argument."""
    return "\"%s\"" % value

def extract_module_names_from_npm_targets(type_targets):
    """Extracts the module names from a list of NPM targets.

    For example: Consider the `@npm//@types/node` target. This function extracts
    `@types/node` from the label. This is needed so that the Node types can be
    resolved from within the test runner through runfile resolution.
    """
    module_names = []

    for type_target in type_targets:
        type_label = Label(type_target)
        type_package = type_label.package

        if type_label.workspace_name != "npm":
            fail("Expected type targets to be part of the `@npm` workspace." +
                 "e.g. `@npm//@types/nodes`.")

        module_names.append(type_package)

    return module_names

def api_golden_test(
        name,
        golden,
        entry_point,
        data = [],
        strip_export_pattern = default_strip_export_pattern,
        types = [],
        **kwargs):
    """Builds an API report for the specified entry-point and compares it against the
    specified golden

    Args;
      name: Name of the test target
      golden: Manifest path to the golden file
      entry_point: Manifest path to the type definition entry-point.
      data: Runtime dependenices needed for the rule (e.g. transitive type definitions)
      strip_export_pattern: An optional regular expression to filter out exports from the golden.
      types: Optional list of type targets to make available in the API report generation.
    """

    quoted_export_pattern = _escape_regex_for_arg(strip_export_pattern)

    kwargs["tags"] = kwargs.get("tags", []) + ["api_guard"]

    # For API golden tests not running against a NPM package, we extract all transitive
    # declarations of the specified `data` targets. This is necessary because API extractor
    # needs to resolve other targets that have been linked by the Bazel NodeJS rules. The
    # linker by default only provides access to JavaScript sources, but the API extractor is
    # specifically concerned with type definitions that we can extract manually here.
    extract_types(
        name = "%s_data_typings" % name,
        deps = data,
    )

    test_data = ["//bazel/api-golden", "//:package.json", ":%s_data_typings" % name] + \
                data + types

    nodejs_test(
        name = name,
        data = test_data,
        entry_point = "//bazel/api-golden:index.ts",
        templated_args = nodejs_test_args + [golden, entry_point, "false", quoted_export_pattern] +
                         extract_module_names_from_npm_targets(types),
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = test_data,
        entry_point = "//bazel/api-golden:index.ts",
        templated_args = nodejs_test_args + [golden, entry_point, "true", quoted_export_pattern] +
                         extract_module_names_from_npm_targets(types),
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
    """Builds an API report for all entry-points within the given NPM package and compares it
      against goldens within the specified directory.

    Args;
      name: Name of the test target
      golden_dir: Manifest path to the golden directory
      npm_package: Manifest path to the NPM package.
      data: Runtime dependenices needed for the rule (e.g. the tree artifact of the NPM package)
      strip_export_pattern: An optional regular expression to filter out exports from the golden.
      types: Optional list of type targets to make available in the API report generation.
    """

    quoted_export_pattern = _escape_regex_for_arg(strip_export_pattern)

    kwargs["tags"] = kwargs.get("tags", []) + ["api_guard"]

    nodejs_test(
        name = name,
        data = ["//bazel/api-golden"] + data + types,
        entry_point = "//bazel/api-golden:index_npm_packages.ts",
        templated_args = nodejs_test_args + [golden_dir, npm_package, "false", quoted_export_pattern] +
                         extract_module_names_from_npm_targets(types),
        **kwargs
    )

    nodejs_binary(
        name = name + ".accept",
        testonly = True,
        data = ["//bazel/api-golden"] + data + types,
        entry_point = "//bazel/api-golden:index_npm_packages.ts",
        templated_args = nodejs_test_args + [golden_dir, npm_package, "true", quoted_export_pattern] +
                         extract_module_names_from_npm_targets(types),
        **kwargs
    )
