workspace(
    name = "dev-infra",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Fetch rules_nodejs so we can install our npm dependencies
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "10f534e1c80f795cffe1f2822becd4897754d18564612510c59b3c73544ae7c6",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/3.5.0/rules_nodejs-3.5.0.tar.gz"],
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

_ESBUILD_VERSION = "0.12.1"
http_archive(
    name = "esbuild_darwin",
    build_file_content = """exports_files(["bin/esbuild"])""",
    sha256 = "efb34692bfa34db61139eb8e46cd6cf767a42048f41c8108267279aaf58a948f",
    strip_prefix = "package",
    urls = [
        "https://registry.npmjs.org/esbuild-darwin-64/-/esbuild-darwin-64-%s.tgz" % _ESBUILD_VERSION,
    ],
)

http_archive(
    name = "esbuild_windows",
    build_file_content = """exports_files(["esbuild.exe"])""",
    sha256 = "10439647b11c7fd1d9647fd98d022fe2188b4877d2d0b4acbe857f4e764b17a9",
    strip_prefix = "package",
    urls = [
        "https://registry.npmjs.org/esbuild-windows-64/-/esbuild-windows-64-%s.tgz" % _ESBUILD_VERSION,
    ],
)

http_archive(
    name = "esbuild_linux",
    build_file_content = """exports_files(["bin/esbuild"])""",
    sha256 = "de8409b90ec3c018ffd899b49ed5fc462c61b8c702ea0f9da013e0e1cd71549a",
    strip_prefix = "package",
    urls = [
        "https://registry.npmjs.org/esbuild-linux-64/-/esbuild-linux-64-%s.tgz" % _ESBUILD_VERSION,
    ],
)
