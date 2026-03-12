load("@npm_rules_browsers//:@web/test-runner/package_json.bzl", wtr = "bin")

def _base_wtr_test(name, mode, deps, tags = [], **kwargs):
    is_firefox = mode == "firefox"
    is_chromium = mode == "chromium"

    browser_deps = []
    toolchains = []
    env = {
        "CI": "1",
        "FORCE_COLOR": "1",
    }

    # Sandbox is very slow, and it seems like modern browsers end up being
    # much stricter at this point. Back with Karma it was possible to run with
    # sandbox, but with a proper runfiles directory the risk here is low, and
    # it also solves some launch problems where e.g. Firefox access `HOME`.
    extra_tags = ["no-sandbox"]

    if is_firefox:
        browser_deps.append("@rules_browsers//browsers/firefox")
        toolchains.append("@rules_browsers//browsers/firefox:toolchain_alias")
        env = {"FIREFOX_BIN": "$(FIREFOX)"}
        extra_tags.append("firefox")
    elif is_chromium:
        browser_deps.append("@rules_browsers//browsers/chromium")
        toolchains.append("@rules_browsers//browsers/chromium:toolchain_alias")
        env = {"CHROME_HEADLESS_BIN": "$(CHROME-HEADLESS-SHELL)"}
        extra_tags.append("chromium")
    else:
        env = {"MANUAL_MODE": "1"}
        extra_tags += ["requires-network", "manual"]

    wtr.wtr_test(
        name = name,
        data = browser_deps + deps + [
            Label("//:node_modules/@web/test-runner-core"),
            Label("//:node_modules/@web/test-runner-puppeteer"),
            Label("//:node_modules/get-port"),
            Label("//:node_modules/web-test-runner-jasmine"),
            Label("//:node_modules/@web/dev-server-rollup"),
            Label("//:node_modules/@rollup/plugin-virtual"),
            "@rules_browsers//wtr:wtr_config",
        ],
        tags = tags + extra_tags,
        env = env,
        toolchains = toolchains,
        fixed_args = [
            "--config=$(rootpath @rules_browsers//wtr:wtr_config)",
            "%s/**/*.spec.js" % native.package_name(),
            "%s/**/*.spec.mjs" % native.package_name(),
            "%s/**/*.spec.cjs" % native.package_name(),
            "%s/**/*_spec.js" % native.package_name(),
            "%s/**/*_spec.mjs" % native.package_name(),
            "%s/**/*_spec.cjs" % native.package_name(),
        ],
        **kwargs
    )

def wtr_test(name, deps, firefox = True, chromium = True, **kwargs):
    tests = []
    if firefox:
        _base_wtr_test("%s_firefox" % name, deps = deps, mode = "firefox", **kwargs)
        tests.append(":%s_firefox" % name)
    if chromium:
        _base_wtr_test("%s_chromium" % name, deps = deps, mode = "chromium", **kwargs)
        tests.append(":%s_chromium" % name)

    _base_wtr_test("%s_debug" % name, deps = deps, mode = "manual", **kwargs)

    if len(tests) == 0:
        fail("A least one of `chromium` or `firefox` must be enabled")

    native.test_suite(
        name = name,
        tests = tests,
    )
