load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

def setup_dependencies_1():
    npm_translate_lock(
        name = "devinfra_npm",
        data = [
            "@devinfra//bazel:package.json",
            "@devinfra//bazel:pnpm-workspace.yaml",
            "@devinfra//bazel/spec-bundling:package.json",
        ],
        pnpm_lock = "@devinfra//bazel:pnpm-lock.yaml",
    )
