load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

def setup_dependencies_1():
    npm_translate_lock(
        name = "devinfra_npm",
        data = [
            "@devinfra//:package.json",
            "@devinfra//bazel:package.json",
            "@devinfra//ng-dev:package.json",
            "@devinfra//bazel/spec-bundling/test:package.json",
            "@devinfra//:pnpm-workspace.yaml",
        ],
        pnpm_lock = "@devinfra//:pnpm-lock.yaml",
        update_pnpm_lock = True,
        npmrc = "@devinfra//:.npmrc",
        yarn_lock = "@devinfra//:yarn.lock",
    )
