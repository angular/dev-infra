"""
  Runs a given test together with the specified server. The server executable is expected
  to support a `PORT` environment variable. The chosen available port is then set as environment
  variable so that the test environment can connect to the server. Use `TEST_SERVER_PORT`.
"""

load("@aspect_rules_js//js:defs.bzl", "js_test")

def server_test(server, test, **kwargs):
    js_test(
        data = [server, test, "@rules_browsers//server_test:lib"],
        args = ["$(rootpath %s)" % server, "$(rootpath %s)" % test],
        entry_point = "@rules_browsers//server_test:test-runner.mjs",
        **kwargs
    )
