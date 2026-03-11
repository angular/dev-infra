"""Helper to define the repositories for Chromium."""

load("//browsers/private:browser_repo.bzl", "browser_repo")
load("//browsers/private/versions:chromium.bzl", "DEFAULT_VERSION", "VERSIONS")

def define_chrome_repositories(version = DEFAULT_VERSION):
    """Defines repositories for Chromium at the specified version.

    Args:
        version: version to use
    """
    if not version in VERSIONS:
        fail("version %s is not available in rules_browsers Chromium" % version)

    for repo_name, repo_info in VERSIONS[version].items():
        browser_repo(
            name = "rules_browsers_chrome_%s" % repo_name,
            sha256 = repo_info["integrity"],
            urls = [repo_info["url"]],
            named_files = repo_info["named_files"],
            exclude_patterns = repo_info["exclude_patterns"],
            exports_files = repo_info["named_files"].values(),
        )
