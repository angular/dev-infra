workspace(
    name = "dev-infra",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "5c40083120eadec50a3497084f99bc75a85400ea727e82e0b2f422720573130f",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/4.0.0-beta.0/rules_nodejs-4.0.0-beta.0.tar.gz"],
)

load("@build_bazel_rules_nodejs//:index.bzl", "node_repositories", "yarn_install")

node_repositories(
    node_version = "14.17.0",
    node_repositories = {
        "14.17.0-darwin_amd64": ("node-v14.17.0-darwin-x64.tar.gz", "node-v14.17.0-darwin-x64", "7b210652e11d1ee25650c164cf32381895e1dcb3e0ff1d0841d8abc1f47ac73e"),
        "14.17.0-linux_amd64": ("node-v14.17.0-linux-x64.tar.xz", "node-v14.17.0-linux-x64", "494b161759a3d19c70e3172d33ce1918dd8df9ad20d29d1652a8387a84e2d308"),
        "14.17.0-windows_amd64": ("node-v14.17.0-win-x64.zip", "node-v14.17.0-win-x64", "6582a7259c433e9f667dcc4ed3e5d68bc514caba2eed40e4626c8b4c7e5ecd5c"),
    },
)

yarn_install(
    name = "npm",
    package_json = "//:package.json",
    yarn_lock = "//:yarn.lock",
)

load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")
npm_bazel_protractor_dependencies()

load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")
web_test_repositories()

load("//bazel/browsers:browser_repositories.bzl", "browser_repositories")
browser_repositories()

load("@npm//@bazel/esbuild:esbuild_repositories.bzl", "esbuild_repositories")
esbuild_repositories()
