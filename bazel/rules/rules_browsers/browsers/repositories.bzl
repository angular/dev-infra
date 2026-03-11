"""Pinned browser versions."""

load("//browsers/chromium:chromedriver.bzl", "define_chromedriver_repositories")
load("//browsers/chromium:chromium.bzl", "define_chrome_repositories")
load("//browsers/firefox:firefox.bzl", "define_firefox_repositories")
load("//browsers/private/versions:chromedriver.bzl", CHROMEDRIVER_DEFAULT_VERSION = "DEFAULT_VERSION")
load("//browsers/private/versions:chromium.bzl", CHROMIUM_DEFAULT_VERSION = "DEFAULT_VERSION")
load("//browsers/private/versions:firefox.bzl", FIREFOX_DEFAULT_VERSION = "DEFAULT_VERSION")

def rules_browsers_repositories(
        chromium_version = CHROMIUM_DEFAULT_VERSION,
        chromedriver_version = CHROMEDRIVER_DEFAULT_VERSION,
        firefox_version = FIREFOX_DEFAULT_VERSION):
    """Load pinned browser versions."""

    define_chrome_repositories(chromium_version)
    define_chromedriver_repositories(chromedriver_version)
    define_firefox_repositories(firefox_version)
