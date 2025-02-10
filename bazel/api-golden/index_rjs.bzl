load("@aspect_rules_js//js:defs.bzl", "js_binary", "js_test")

default_strip_export_pattern = "^ɵ(?!ɵdefineInjectable|ɵinject|ɵInjectableDef)"

def _escape_regex_for_arg(value):
    """Escapes a Regular expression so that it can be passed as process argument."""
    return "\"%s\"" % value

def api_golden_test_npm_package(
        name,
        golden_dir,
        npm_package,
        data = [],
        strip_export_pattern = default_strip_export_pattern,
        types = {},
        **kwargs):
    """Builds an API report for all entry-points within the given NPM package and compares it.

    Args:
      name: Name of the test target
      golden_dir: Short path to the golden directory
      npm_package: Short path to the NPM package.
      data: Runtime dependenices needed for the rule (e.g. the tree artifact of the NPM package)
      strip_export_pattern: An optional regular expression to filter out exports from the golden.
      types: Optional list of type targets to make available in the API report generation.
      **kwargs: Other arguments passed to `js_binary`/`js_test` (depending on approval mode)
    """

    quoted_export_pattern = _escape_regex_for_arg(strip_export_pattern)

    kwargs["tags"] = kwargs.get("tags", []) + ["api_guard"]

    data.append("@devinfra//bazel/api-golden")

    type_names = []
    for type_label, n in types.items():
        data.append(type_label)
        type_names.append(n)

    js_test(
        name = name,
        data = data,
        entry_point = "@devinfra//bazel/api-golden:index_npm_packages.js",
        args = [golden_dir, npm_package, "false", quoted_export_pattern] + type_names,
        **kwargs
    )

    js_binary(
        name = name + ".accept",
        testonly = True,
        data = data,
        entry_point = "@devinfra//bazel/api-golden:index_npm_packages.js",
        args = [golden_dir, npm_package, "true", quoted_export_pattern] + type_names,
        **kwargs
    )
