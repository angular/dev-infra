load("@aspect_rules_js//npm:defs.bzl", _npm_package = "npm_package")
load("//src/ng_package:angular_package_format.bzl", "angular_package_format")
load("//src/ng_package/text_replace:index.bzl", "text_replace")

def ng_package(
        name,
        nested_packages = [],
        substitutions = {},
        tags = [],
        replace_prefixes = {},
        data = [],
        **kwargs):
    angular_package_format(
        name = "%s_apf" % name,
        **kwargs
    )

    text_replace(
        name = "%s_apf_substituted" % name,
        srcs = [":%s_apf" % name],
        substitutions = substitutions,
    )

    _npm_package(
        name = name,
        srcs = [
            "%s_apf_substituted" % name,
        ] + nested_packages + data,
        replace_prefixes = dict({
            "%s_apf_substituted/%s_apf" % (name, name): "/",
            "schematics/npm_package/": "schematics/",
            "schematics/pkg/": "schematics/",
        }, **replace_prefixes),
        tags = tags,
        package = kwargs.get("package", None),
    )
