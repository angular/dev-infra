load("//bazel/browsers:browser_archive_repo.bzl", "browser_archive")

"""
  Defines repositories for Firefox that can be used inside Karma unit tests
  and Protractor e2e tests with Bazel.
"""

def define_firefox_repositories():
    # Instructions on updating the Firefox version can be found in the `README.md` file
    # next to this file.

    browser_archive(
        name = "org_mozilla_firefox_linux_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "0f702f7690b02953e336fac27874276d9d471c9d264dc0feb7fcc6693d63bd4b",
        # Firefox v125.0.1
        urls = [
            "https://ftp.mozilla.org/pub/firefox/releases/125.0.1/linux-x86_64/en-US/firefox-125.0.1.tar.bz2",
            "https://storage.googleapis.com/dev-infra-mirror/firefox/125.0.1/linux_x64/browser-bin.tar.bz2",
        ],
        named_files = {
            "FIREFOX": "firefox/firefox",
        },
    )

    browser_archive(
        # Firefox has a launcher that conditionally starts x64/arm64
        name = "org_mozilla_firefox_macos",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "3f431079d423e5397987a4120a63948217252426219f23348cb6b6bbded3acf3",
        # Firefox v125.0.1
        urls = [
            "https://ftp.mozilla.org/pub/firefox/releases/125.0.1/mac/en-US/Firefox%20125.0.1.dmg",
            "https://storage.googleapis.com/dev-infra-mirror/firefox/125.0.1/mac_x64/browser-bin.dmg",
        ],
        named_files = {
            "FIREFOX": "Firefox.app/Contents/MacOS/firefox",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_linux_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "79b2e77edd02c0ec890395140d7cdc04a7ff0ec64503e62a0b74f88674ef1313",
        # Geckodriver v0.34.0
        urls = [
            "https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-linux64.tar.gz",
            "https://storage.googleapis.com/dev-infra-mirror/firefox/125.0.1/linux_x64/driver-bin.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_x64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "9cec1546585b532959782c8220599aa97c1f99265bb2d75ad00cd56ef98f650c",
        # Geckodriver v0.34.0
        urls = [
            "https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-macos.tar.gz",
            "https://storage.googleapis.com/dev-infra-mirror/firefox/125.0.1/mac_x64/driver-bin.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )

    browser_archive(
        name = "org_mozilla_geckodriver_macos_arm64",
        licenses = ["reciprocal"],  # MPL 2.0
        sha256 = "d33232d29d764018d83e7e4e0c25ac274b5548658c605421c4373e64ba81d904",
        # Geckodriver v0.34.0
        urls = [
            "https://github.com/mozilla/geckodriver/releases/download/v0.34.0/geckodriver-v0.34.0-macos-aarch64.tar.gz",
            "https://storage.googleapis.com/dev-infra-mirror/firefox/125.0.1/mac_arm64/driver-bin.tar.gz",
        ],
        named_files = {
            "GECKODRIVER": "geckodriver",
        },
    )
