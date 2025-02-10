load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

def setup_dependencies_1():
    npm_translate_lock(
        name = "devinfra_npm",
        data = [
            "@devinfra//bazel:package.json",
            "@devinfra//bazel:pnpm-workspace.yaml",
        ],
        pnpm_lock = "@devinfra//bazel:pnpm-lock.yaml",
    )
