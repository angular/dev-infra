load("@aspect_rules_js//js:defs.bzl", "js_test")

def validate_ts_version_matching(package_json, module_lock_file):
    js_test(
        name = "validate_ts_version_match",
        data = [
            package_json,
            module_lock_file,
        ],
        entry_point = "@devinfra//bazel/validation:verify-typescript",
        fixed_args = [
            "$(rlocationpath %s)" % package_json,
            "$(rlocationpath %s)" % module_lock_file,
        ],
    )
