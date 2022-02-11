load(
    "@npm//@bazel/concatjs:index.bzl",
    _karma_web_test = "karma_web_test",
    _karma_web_test_suite = "karma_web_test_suite",
)

def _karma_local_browsers_target(name, **web_test_args):
    """Macro for defining a standalone karma web test target that starts Karma
      without a browser, allowing for manual debugging."""

    # Custom standalone web test that can be run to test against any browser
    # that is manually connected to.
    _karma_web_test(
        name = "%s_bin" % name,
        config_file = "//bazel/karma:karma-local-config.js",
        tags = ["manual"],
        **web_test_args
    )

    # Workaround for: https://github.com/bazelbuild/rules_nodejs/issues/1429
    native.sh_test(
        name = name,
        srcs = ["%s_bin" % name],
        tags = ["manual", "local", "ibazel_notify_changes"],
        testonly = True,
    )

def karma_web_test_suite(name, **kwargs):
    """Wrapper for the default `karma_web_test_suite` with additional default browsers,
      and a local target to ease debugging."""

    # Set up default browsers if no explicit `browsers` have been specified.
    if not hasattr(kwargs, "browsers"):
        kwargs["tags"] = ["native"] + kwargs.get("tags", [])
        kwargs["browsers"] = [
            "//bazel/browsers/chromium:chromium",
            "//bazel/browsers/firefox:firefox",
        ]

    # Filter out options which are specific to "karma_web_test" targets. We cannot
    # pass options like "browsers" to the local web test target.
    web_test_args = {}
    for opt_name in kwargs.keys():
        if not opt_name in ["wrapped_test_tags", "browsers", "wrapped_test_tags", "tags"]:
            web_test_args[opt_name] = kwargs[opt_name]

    # Custom standalone web test that can be run to test against any browser
    # that is manually connected to.
    _karma_local_browsers_target(name = "%s_local" % name)

    # Default test suite with all configured browsers.
    _karma_web_test_suite(name = name, **kwargs)
