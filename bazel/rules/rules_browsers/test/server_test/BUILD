load("@aspect_rules_js//js:defs.bzl", "js_binary")
load("@rules_browsers//server_test:index.bzl", "server_test")

js_binary(
    name = "server_bin",
    entry_point = "server.mjs",
)

js_binary(
    name = "test_bin",
    entry_point = "test.mjs",
)

server_test(
    name = "test",
    server = ":server_bin",
    test = ":test_bin",
)
