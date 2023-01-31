workspace(
    name = "dev-infra",
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
    sha256 = "78efa335c53253ed5c2b731bce8e654922c92f9f49337f9ee63b275c61989b33",
    strip_prefix = "rules_sass-1f277900101a3d057392df55b2d6f332df34087a",
    urls = [
        "https://github.com/bazelbuild/rules_sass/archive/1f277900101a3d057392df55b2d6f332df34087a.zip",
    ],
)

http_archive(
    name = "aspect_rules_js",
    sha256 = "9f51475dd2f99abb015939b1cf57ab5f15ef36ca6d2a67104450893fd0aa5c8b",
    strip_prefix = "rules_js-1.16.0",
    url = "https://github.com/aspect-build/rules_js/archive/refs/tags/v1.16.0.tar.gz",
)

http_archive(
    name = "aspect_rules_ts",
    sha256 = "acb20a4e41295d07441fa940c8da9fd02f8637391fd74a14300586a3ee244d59",
    strip_prefix = "rules_ts-1.2.0",
    url = "https://github.com/aspect-build/rules_ts/archive/refs/tags/v1.2.0.tar.gz",
)

http_archive(
    name = "aspect_rules_esbuild",
    sha256 = "f05e9a53ae4b394ca45742ac35f7e658a8ba32cba14b5d531b79466ae86dc7f0",
    strip_prefix = "rules_esbuild-0.14.0",
    url = "https://github.com/aspect-build/rules_esbuild/archive/refs/tags/v0.14.0.tar.gz",
)

load("@aspect_rules_js//js:repositories.bzl", "rules_js_dependencies")

rules_js_dependencies()

load("@rules_nodejs//nodejs:repositories.bzl", "nodejs_register_toolchains")

nodejs_register_toolchains(
    name = "nodejs",
    node_version = "16.10.0",
)

load("@aspect_rules_js//npm:npm_import.bzl", "npm_translate_lock")

npm_translate_lock(
    name = "npm",
    npmrc = "//:.npmrc",
    pnpm_lock = "//:pnpm-lock.yaml",
    verify_node_modules_ignored = "//:.bazelignore",
)

load("@npm//:repositories.bzl", "npm_repositories")

npm_repositories()

load("@aspect_rules_ts//ts:repositories.bzl", "rules_ts_dependencies")

rules_ts_dependencies(
    ts_version_from = "//:package.json",
)

load("@aspect_rules_esbuild//esbuild:dependencies.bzl", "rules_esbuild_dependencies")

rules_esbuild_dependencies()

load("@aspect_rules_esbuild//esbuild:repositories.bzl", "LATEST_VERSION", "esbuild_register_toolchains")

esbuild_register_toolchains(
    name = "esbuild",
    esbuild_version = LATEST_VERSION,
)

#yarn_install(
#    name = "ts_proto_npm",
##    args = ["--immutable"],
#    data = [
#        "//:.yarn/releases/yarn-3.2.3.cjs",
#        "//tools/ts_proto:.yarnrc.yml",
#    ],
#    exports_directories_only = False,
#    package_json = "//tools/ts_proto:package.json",
#    yarn = "//:.yarn/releases/yarn-3.2.3.cjs",
#    yarn_lock = "//tools/ts_proto:yarn.lock",
#)

#load("@npm//@bazel/protractor:package.bzl", "npm_bazel_protractor_dependencies")

#npm_bazel_protractor_dependencies()

http_archive(
    name = "io_bazel_rules_webtesting",
    sha256 = "e9abb7658b6a129740c0b3ef6f5a2370864e102a5ba5ffca2cea565829ed825a",
    urls = [
        "https://github.com/bazelbuild/rules_webtesting/releases/download/0.3.5/rules_webtesting.tar.gz",
    ],
)

load("@io_bazel_rules_webtesting//web:repositories.bzl", "web_test_repositories")

web_test_repositories()

load("//bazel/browsers:browser_repositories.bzl", "browser_repositories")

browser_repositories()

#load("@build_bazel_rules_nodejs//toolchains/esbuild:esbuild_repositories.bzl", "esbuild_repositories")

#esbuild_repositories(
#    npm_repository = "npm",
#)

load("@rules_pkg//:deps.bzl", "rules_pkg_dependencies")

rules_pkg_dependencies()

#load("@io_bazel_rules_sass//:defs.bzl", "sass_repositories")

#sass_repositories(
#    yarn_script = "//:.yarn/releases/yarn-1.22.17.cjs",
#)

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
