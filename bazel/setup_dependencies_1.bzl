load("@aspect_rules_js//npm:repositories.bzl", "npm_translate_lock")

def setup_dependencies_1():
    npm_translate_lock(
        name = "devinfra_npm",
        data = [
            "@devinfra//:package.json",
            "@devinfra//bazel:package.json",
            "@devinfra//.github/local-actions/branch-manager:package.json",
            "@devinfra//.github/local-actions/labels-sync:package.json",
            "@devinfra//.github/local-actions/lock-closed:package.json",
            "@devinfra//github-actions/google-internal-tests:package.json",
            "@devinfra//github-actions/pull-request-labeling:package.json",
            "@devinfra//github-actions/unified-status-check:package.json",
            "@devinfra//github-actions/previews/pack-and-upload-artifact:package.json",
            "@devinfra//github-actions/previews/upload-artifacts-to-firebase:package.json",
            "@devinfra//github-actions/post-approval-changes:package.json",
            "@devinfra//github-actions/branch-manager:package.json",
            "@devinfra//github-actions/saucelabs:package.json",
            "@devinfra//github-actions/browserstack:package.json",
            "@devinfra//github-actions/bazel/configure-remote:package.json",
            "@devinfra//github-actions/org-file-sync:package.json",
            "@devinfra//github-actions/feature-request:package.json",
            "@devinfra//ng-dev:package.json",
            "@devinfra//bazel/spec-bundling/test:package.json",
            "@devinfra//:pnpm-workspace.yaml",
        ],
        pnpm_lock = "@devinfra//:pnpm-lock.yaml",
        update_pnpm_lock = True,
        npmrc = "@devinfra//:.npmrc",
        yarn_lock = "@devinfra//:yarn.lock",
    )
