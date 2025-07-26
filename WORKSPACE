workspace(
    name = "devinfra",
)

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

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
    sha256 = "bff856619317a388292970a7d4bfea8c9e627a1886fe7132075d378d4067c09e",
    strip_prefix = "rules_sass-cbe5261f925751a465a1a54bf2147e5f696ec567",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/cbe5261f925751a465a1a54bf2147e5f696ec567.zip",
    ],
)

# Fetch rules_nodejs and install its dependencies so we can install our npm dependencies.
http_archive(
    name = "build_bazel_rules_nodejs",
    patches = [
        "//tools:bazel-patches/build_bazel_rules_nodejs.patch",
    ],
    sha256 = "709cc0dcb51cf9028dd57c268066e5bc8f03a119ded410a13b5c3925d6e43c48",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/5.8.4/rules_nodejs-5.8.4.tar.gz"],
)

load("@build_bazel_rules_nodejs//:repositories.bzl", "build_bazel_rules_nodejs_dependencies")

build_bazel_rules_nodejs_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_repositories = {
        "20.19.0-darwin_arm64": ("node-v20.19.0-darwin-arm64.tar.gz", "node-v20.19.0-darwin-arm64", "c016cd1975a264a29dc1b07c6fbe60d5df0a0c2beb4113c0450e3d998d1a0d9c"),
        "20.19.0-darwin_amd64": ("node-v20.19.0-darwin-x64.tar.gz", "node-v20.19.0-darwin-x64", "a8554af97d6491fdbdabe63d3a1cfb9571228d25a3ad9aed2df856facb131b20"),
        "20.19.0-linux_arm64": ("node-v20.19.0-linux-arm64.tar.xz", "node-v20.19.0-linux-arm64", "dbe339e55eb393955a213e6b872066880bb9feceaa494f4d44c7aac205ec2ab9"),
        "20.19.0-linux_ppc64le": ("node-v20.19.0-linux-ppc64le.tar.xz", "node-v20.19.0-linux-ppc64le", "84937108f005679e60b486ed8e801cebfe923f02b76d8e710463d32f82181f65"),
        "20.19.0-linux_s390x": ("node-v20.19.0-linux-s390x.tar.xz", "node-v20.19.0-linux-s390x", "11f8ee99d792a83bba7b29911e0229dd6cd5e88987d7416346067db1cc76d89a"),
        "20.19.0-linux_amd64": ("node-v20.19.0-linux-x64.tar.xz", "node-v20.19.0-linux-x64", "b4e336584d62abefad31baecff7af167268be9bb7dd11f1297112e6eed3ca0d5"),
        "20.19.0-windows_amd64": ("node-v20.19.0-win-x64.zip", "node-v20.19.0-win-x64", "be72284c7bc62de07d5a9fd0ae196879842c085f11f7f2b60bf8864c0c9d6a4f"),
    },
    node_version = "20.19.0",
)

http_archive(
    name = "aspect_rules_js",
    sha256 = "ca638e0aa33b087706bc7f5e887ce01cdf6ec82de00660f22409fa8be34a8ce2",
    strip_prefix = "rules_js-2.4.1",
    url = "https://github.com/aspect-build/rules_js/releases/download/v2.4.1/rules_js-v2.4.1.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@aspect_rules_js//js:toolchains.bzl", "rules_js_register_toolchains")

rules_js_register_toolchains()

load("@build_bazel_rules_nodejs//:index.bzl", "yarn_install")

yarn_install(
    name = "npm",
    # Yarn Berry/v2+ expects `--immutable` instead of `--frozen-lockfile`.
    args = ["--immutable"],
    data = [
        "//:.yarn/patches/@angular-bazel-npm.patch",
        "//:.yarn/patches/@bazel-jasmine-npm.patch",
        "//:.yarn/patches/@octokit-graphql-schema-npm-15.3.0-4046a59648.patch",
        "//:.yarn/releases/yarn-4.9.1.cjs",
        "//:.yarnrc.yml",
    ],
    # Currently disabled due to:
    #  1. Missing Windows support currently.
    #  2. Incompatibilites with the `ts_library` rule.
    exports_directories_only = False,
    package_json = "//:package.json",
    yarn = "//:.yarn/releases/yarn-4.9.1.cjs",
    yarn_lock = "//:yarn.lock",
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
)

http_archive(
    name = "aspect_rules_ts",
    sha256 = "09af62a0d46918d815b5f48b5ed0f5349b62c15fc42fcc3fef5c246504ff8d99",
    strip_prefix = "rules_ts-3.6.3",
    url = "https://github.com/aspect-build/rules_ts/releases/download/v3.6.3/rules_ts-v3.6.3.tar.gz",
)

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    ts_integrity = "sha512-p1diW6TqL9L07nNxvRMM7hMMw4c5XOo/1ibL4aAIGmSAt9slTE1Xgw5KWuof2uTOvCg9BY7ZRi+GaF+7sfgPeQ==",
    ts_version_from = "//bazel:package.json",
)

load("//bazel:setup_dependencies_1.bzl", "setup_dependencies_1")

setup_dependencies_1()

load("//bazel:setup_dependencies_2.bzl", "setup_dependencies_2")

setup_dependencies_2()

# TODO: Move this to the setup scripts. E.g. following proposals like:
# go/ng:sharing-infra-code.
http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "530adfeae30bbbd097e8af845a44a04b641b680c5703b3bf885cbd384ffec779",
    strip_prefix = "rules_esbuild-0.22.1",
    url = "https://github.com/aspect-build/rules_esbuild/releases/download/v0.22.1/rules_esbuild-v0.22.1.tar.gz",
)

load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")

rules_esbuild_dependencies()

load("@aspect_rules_esbuild//esbuild:repositories.bzl", "LATEST_ESBUILD_VERSION", "esbuild_register_toolchains")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = LATEST_ESBUILD_VERSION,
)
