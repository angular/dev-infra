workspace(
    name = "devinfra",
    managed_directories = {"@npm": ["node_modules"]},
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive", "http_file")

# The PKG rules are needed to build tar packages for integration tests. The builtin
# rule in `@bazel_tools` is not Windows compatible and outdated.
http_archive(
    name = "rules_pkg",
    sha256 = "8c20f74bca25d2d442b327ae26768c02cf3c99e93fad0381f32be9aab1967675",
    urls = [
        "https://mirror.bazel.build/github.com/bazelbuild/rules_pkg/releases/download/0.8.1/rules_pkg-0.8.1.tar.gz",
        "https://github.com/bazelbuild/rules_pkg/releases/download/0.8.1/rules_pkg-0.8.1.tar.gz",
    ],
)

http_archive(
    name = "io_bazel_rules_sass",
    sha256 = "0c41055203bd4f6c58dc7431805b336abf4a0e5283955497bbc918bd0ce90b23",
    strip_prefix = "rules_sass-d829b6a77d9d88c7bf43144b0963e32ed359fe74",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/d829b6a77d9d88c7bf43144b0963e32ed359fe74.zip",
    ],
)

# Fetch rules_nodejs and install its dependencies so we can install our npm dependencies.
http_archive(
    name = "build_bazel_rules_nodejs",
    sha256 = "709cc0dcb51cf9028dd57c268066e5bc8f03a119ded410a13b5c3925d6e43c48",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.4/rules_nodejs-5.8.4.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_repositories = {
        "18.20.0-darwin_arm64": ("node-v18.20.0-darwin-arm64.tar.gz", "node-v18.20.0-darwin-arm64", "10066ad4dd9e03ea5c4c45ef8775420ff37b860de09bbdf87b97e0c07b1ea036"),
        "18.20.0-darwin_amd64": ("node-v18.20.0-darwin-x64.tar.gz", "node-v18.20.0-darwin-x64", "062ba71618e88e06321de5caa038843c350aababa2d315f3ca7b8551f8e66c1c"),
        "18.20.0-linux_arm64": ("node-v18.20.0-linux-arm64.tar.xz", "node-v18.20.0-linux-arm64", "afe51da9ffb38ac1e3a20d9a06efd403ced4bf8831ab554a02a088dd8392fd79"),
        "18.20.0-linux_ppc64le": ("node-v18.20.0-linux-ppc64le.tar.xz", "node-v18.20.0-linux-ppc64le", "9e652bbf53a3e37285b11dfb9d6a9bb8b02010c3b50e5c8229d4cc10e72681da"),
        "18.20.0-linux_s390x": ("node-v18.20.0-linux-s390x.tar.xz", "node-v18.20.0-linux-s390x", "a6c2a5796b9d9e9bf21da62ec89ff30b41a8108880b9eaa3c912f1ce795a7743"),
        "18.20.0-linux_amd64": ("node-v18.20.0-linux-x64.tar.xz", "node-v18.20.0-linux-x64", "03eea148e56785babb27930b05ed6bf311aaa3bc573c0399dd63cad2fe5713c7"),
        "18.20.0-windows_amd64": ("node-v18.20.0-win-x64.zip", "node-v18.20.0-win-x64", "1c0aab05cc6836a8f5148cca345b92ebc948a4a2013f18d117b7ade6ff05aca6"),
    },
    # We need at least Node 18.17 due to some transitive dependencies.
    node_version = "18.20.0",
)

load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    # Yarn Berry/v2+ expects `--immutable` instead of `--frozen-lockfile`.
    args = ["--immutable"],
    data = [
        "//:.yarn/releases/yarn-4.6.0.cjs",
        "//:.yarnrc.yml",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    package_json = "//:package.json",
    # We prefer to symlink the `node_modules` to only maintain a single install.
    # See https://github.com/angular/dev-infra/pull/446#issuecomment-1059820287 for details.
    symlink_node_modules = True,
    yarn = "//:.yarn/releases/yarn-4.6.0.cjs",
    yarn_lock = "//:yarn.lock",
)

yarn_install(
    name = "ts_proto_npm",
    args = ["--immutable"],
    data = [
        "//:.yarn/releases/yarn-4.6.0.cjs",
        "//tools/ts_proto:.yarnrc.yml",
    ],
    exports_directories_only = False,
    package_json = "//tools/ts_proto:package.json",
    yarn = "//:.yarn/releases/yarn-4.6.0.cjs",
    yarn_lock = "//tools/ts_proto:yarn.lock",
)

load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

npm_bazel_protractor_dependencies()

load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("//bazel/browsers:browser_repositories.bzl", "browser_repositories")

browser_repositories()

load("@build_bazel_rules_nodejs//toolchains/esbuild:esbuild_repositories.bzl", "esbuild_repositories")

esbuild_repositories(
    npm_repository = "npm",
)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

sass_repositories(
    yarn_script = "//:.yarn/releases/yarn-1.22.17.cjs",
)

register_toolchains(
    "//bazel/git-toolchain:git_linux_toolchain",
    "//bazel/git-toolchain:git_macos_x86_toolchain",
    "//bazel/git-toolchain:git_macos_arm64_toolchain",
    "//bazel/git-toolchain:git_windows_toolchain",
)

http_file(
    name = "bazel_test_status_proto",
    sha256 = "61ce1dc62fdcfd6d68624a403e0f04c5fd5136d933b681467aad1ad2d00dbb03",
    urls = ["https://raw.githubusercontent.com/bazelbuild/bazel/5.0.0/src/main/protobuf/test_status.proto"],
)
