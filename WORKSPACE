workspace(
    name = "devinfra",
)

load("@bazel_tools//tools/build_defs/repo:git.bzl", "git_repository")
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

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

http_archive(
    name = "aspect_rules_js",
    sha256 = "b71565da7a811964e30cccb405544d551561e4b56c65f0c0aeabe85638920bd6",
    strip_prefix = "rules_js-2.4.2",
    url = "https://github.com/aspect-build/rules_js/releases/download/v2.4.2/rules_js-v2.4.2.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@aspect_rules_js//js:toolchains.bzl", "rules_js_register_toolchains")

rules_js_register_toolchains(
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

git_repository(
    name = "rules_browsers",
    commit = "56ef8007ea07cd1916429bca8bb523433b0e9cdc",
    remote = "https://github.com/devversion/rules_browsers.git",
)

load("@rules_browsers//setup:step_1.bzl", "rules_browsers_setup_1")

rules_browsers_setup_1()

load("@rules_browsers//setup:step_2.bzl", "rules_browsers_setup_2")

rules_browsers_setup_2()

http_archive(
    name = "aspect_rules_jasmine",
    sha256 = "0d2f9c977842685895020cac721d8cc4f1b37aae15af46128cf619741dc61529",
    strip_prefix = "rules_jasmine-2.0.0",
    url = "https://github.com/aspect-build/rules_jasmine/releases/download/v2.0.0/rules_jasmine-v2.0.0.tar.gz",
)

load("@aspect_rules_jasmine//jasmine:dependencies.bzl", "rules_jasmine_dependencies")

rules_jasmine_dependencies()

git_repository(
    name = "rules_angular",
    commit = "c8af5c0d27c66387e9e7df3c4dd3155ce7582609",
    remote = "https://github.com/devversion/rules_angular.git",
)

load("@rules_angular//setup:step_1.bzl", "rules_angular_step1")

rules_angular_step1()

load("@rules_angular//setup:step_2.bzl", "rules_angular_step2")

rules_angular_step2()

load("@rules_angular//setup:step_3.bzl", "rules_angular_step3")

rules_angular_step3(
    angular_compiler_cli = "@devinfra//:node_modules/@angular/compiler-cli",
    typescript = "@devinfra//:node_modules/typescript",
)

git_repository(
    name = "rules_sass",
    commit = "cc1e845339fc45d3c8390445014d5824b85a0948",
    remote = "https://github.com/devversion/rules_sass.git",
)

load("@rules_sass//src/toolchain:repositories.bzl", "setup_rules_sass")

setup_rules_sass()
